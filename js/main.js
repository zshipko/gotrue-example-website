var api = new GoTrue({
    APIUrl: "http://127.0.0.1:9999"
})

var qs = (function(a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i)
    {
        var p=a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
})(window.location.search.substr(1).split('&'));

var app = new Vue({
    el: "#app",

    data() {
        return {
            login_email: '',
            login_password: '',
            login_remember: true,
            signup_email: '',
            signup_password: '',
            page: '',
            user: api.currentUser(),
            message: '',
			code: qs['code'],
            provider: qs['provider'] || 'github',
            _tm: null,
        }
    },

    created() {
        if (this.code){
            this.login_external();
        }
    },

    methods: {
        login() {
            api.login(this.login_email, this.login_password, this.login_remember)
                .then((user) => {
                    app.show_message("Logged in");
                    app.login_email = '';
                    app.login_password = '';
                    app.user = user;
                }, (err) => {
                    app.show_message(err.msg);
                })
        },

        login_external() {
            api.login_external(this.provider, this.code, this.login_remember)
                .then((user) => {
                    app.show_message("Logged in");
                    app.login_email = '';
                    app.login_password = '';
                    app.user = user;
                }, (err) => {
                    app.show_message(err.msg);
                })
        },

        signup() {
            api.signup(this.signup_email, this.signup_password)
                .then((user) => {
                    app.show_message("Account created");
                    app.signup_email = '';
                    app.signup_password = '';
                    app.page = '';
                }, (err) => {
                    app.show_message(err.msg);
                })
        },

		signup_external() {
			api.signup_external(this.external_provider, this.external_provider_code)
				.then((user) => {
					app.show_message("Account created");
					app.external_provider = '';
					app.external_provider_code = '';
					app.page = '';
				}, (err) => {
					app.show_message(err.msg);
				});
		},


        logout() {
            try {
                api.currentUser().logout()
                    .then(() => {
                        app.user = null;
                    });
            } catch (exc) {
                app.user = null;
            }

            this.show_message("Logged out");
        },

        show_message(txt) {
            this.message = txt;

            if (this._tm){
                clearInterval(this._tm)
            }

            this._tm = setTimeout(() => {
                app.message = '';
            }, 4000)
        }
    }
});



