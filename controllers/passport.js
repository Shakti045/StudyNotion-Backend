const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const LinkedInStrategy=  require('passport-linkedin-oauth2').Strategy;
const passport = require("passport");

const GOOGLE_CLIENT_ID ="321817081179-aqm1p0huegj2j0akufu9utl2cfga7dak.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

const GITHUB_CLIENT_ID = "3ebc16257f280118cfd0";
const GITHUB_CLIENT_SECRET = "f5464ae658c6364d55c1a051bf3d44bb64ef337b";


passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, email,done) {
      done(null, email);
    }
  )
);




passport.use(
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "/auth/github/callback",
    },
    function (accessToken, refreshToken, email, done) {
      done(null, email);
    }
  )
);


passport.use(new LinkedInStrategy({
  clientID: "774vhyz2th4o7v",
  clientSecret: "wIrhQbcMeJY9u5E9",
  callbackURL: "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
}, function(accessToken, refreshToken, email, done) {
    return done(null, email);
}));



passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});



module.exports=passport;