var api = new GoTrue({
    APIUrl: "http://127.0.0.1:9999"
})

let GITHUB_CLIENT_ID = 'b1a5569fe5ca55a141bf';
let GITHUB_API_URL = 'https://github.com/login/oauth/authorize?client_id='+GITHUB_CLIENT_ID+'&scope=user:email&redirect_uri=http://127.0.0.1:8000';

let BITBUCKET_CLIENT_ID = 'TZrZ59Ps4kXrVTj9uN';
let BITBUCKET_API_URL = 'https://bitbucket.org/site/oauth2/authorize?client_id='+BITBUCKET_CLIENT_ID+'&scope=account&response_type=code';

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
            provider: localStorage.getItem("provider"),
            _tm: null,
        }
    },

    created() {
        if (this.code && localStorage.getItem("providerAction") === 'signup'){
            this.show_message("Signing up");
            this.signupExternal();
            localStorage.removeItem("providerAction");
        } else if (this.code) {
            this.show_message("Logging in");
            this.loginExternal();
            localStorage.removeItem("providerAction")
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

        githubFlow() {
            localStorage.setItem("providerAction", this.page || 'login');
            localStorage.setItem("provider", 'github');
            window.location = GITHUB_API_URL;
        },

        bitbucketFlow() {
            localStorage.setItem("providerAction", this.page || 'login');
            localStorage.setItem("provider", 'bitbucket');
            window.location = BITBUCKET_API_URL;
        },

        loginExternal() {
            api.loginExternal(this.provider, this.code, true)
                .then((user) => {
                    window.location.search = '';
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

		signupExternal() {
			api.signupExternal(this.provider, this.code)
				.then((user) => {
                    window.location.search = '';
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



