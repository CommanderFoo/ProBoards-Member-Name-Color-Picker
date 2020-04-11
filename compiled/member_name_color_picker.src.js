class Member_Name_Color_Picker {

	static init(){
		this.PLUGIN_ID = "pd_member_name_color_picker";
		this.PLUGIN_KEY = "pd_member_name_color_picker";

		this.KEY_DATA = new Map();

		this.SETTINGS = {};
		this.IMAGES = {};

		if(typeof yootil == "undefined"){
			console.error("Member Name Color Picker: Yootil not installed");
			return;
		}

		this.setup();
		this.setup_data();

		yootil.bar.add("#", this.IMAGES.color, "Set Your Name Color", "member-name-color-picker", () => null);

		$(this.ready.bind(this));
	}

	static ready(){
		if(yootil.user.logged_in()){
			this.create_color_field();
		}

		let location_check = (
			yootil.location.search_results() ||
			yootil.location.message_thread() ||
			yootil.location.thread() ||
			yootil.location.recent_posts() ||
			yootil.location.recent_threads() ||
			yootil.location.message_list() ||
			yootil.location.members() ||
			yootil.location.board()
		);

		this.apply_color();

		if(location_check){
			yootil.event.after_search(this.apply_color, this);
		}

		if($(".shoutbox.container").length > 0){
			this.monitor_shoutbox();
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			this.SETTINGS = plugin.settings;
			this.IMAGES = plugin.images;
		}
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.PLUGIN_KEY];

		for(let key in user_data){
			let id = parseInt(key, 10) || 0;

			if(id && !this.KEY_DATA.has(id)){
				this.KEY_DATA.set(id, user_data[key]);
			}
		}
	}

	static create_color_field(){
		let user_id = parseInt(yootil.user.id(), 10);
		let user_color = "";

		if(this.KEY_DATA.has(user_id)){
			let _user_color = this.KEY_DATA.get(user_id);

			if(this.is_valid_color(_user_color)){
				user_color = _user_color;
			}
		}

		let $color_field = $("<input type='color' name='member-name-color-picker-field' id='member-name-color-picker-field' value='" + pb.text.escape_html(user_color) + "' />");

		$color_field.on("input", e => {

			this.apply_color($(".user-link[data-id=" + parseInt(yootil.user.id(), 10) + "]"), e.target.value);

		})

		$color_field.on("change", e => {

			if(this.is_valid_color(e.target.value)){
				let user_id = parseInt(yootil.user.id(), 10);

				yootil.key.set(this.PLUGIN_KEY, e.target.value, user_id);

				this.KEY_DATA.set(user_id, e.target.color);
				this.apply_color($(".user-link"));
			}

		});

		$color_field.attr("title", "Change your display name color");

		let $item = $(yootil.bar.get("member-name-color-picker"));

		$item.replaceWith($color_field);
	}

	static is_valid_color(c){
		if(/^#[a-zA-Z0-9]{3,6}$/.test(c)){
			return true;
		}

		return false;
	}

	static monitor_shoutbox(){
		let self = this;

		$.ajaxPrefilter(function(opts, orig_opts){
			if(orig_opts.url == proboards.data("shoutbox_update_url")){
				let orig_success = orig_opts.success;

				opts.success = function(){
					orig_success.apply(this, self.parse_realtime.apply(self, arguments));
				};
			}
		});
	}

	static parse_realtime(){
		if(arguments && arguments.length && arguments[0].shoutbox_post){
			let container = $("<span />").html(arguments[0].shoutbox_post);
			let posts = container.find("div.shoutbox-post");

			this.apply_color(posts.find(".user-link"));

			arguments[0].shoutbox_post = container.html();
		}

		return arguments || [];
	}

	static user_has_color(preview){
		let color = (preview)? preview : yootil.key.value(this.PLUGIN_KEY, parseInt(yootil.user.id(), 10));

		if(color && this.is_valid_color(color)){
			return color;
		}

		return false;
	}

	static apply_color(items, preview){
		items = items || $(".user-link");

		items.each((i, e) => {

			let id = parseInt($(e).attr("data-id"), 10);

			if(this.KEY_DATA.has(id) || preview){
				let color = (preview)? preview : this.KEY_DATA.get(id);

				if(this.is_valid_color(color)){
					$(e).css("color", pb.text.escape_html(color));
				}
			}

		});
	}

}

Member_Name_Color_Picker.init();