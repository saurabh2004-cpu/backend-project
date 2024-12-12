import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from "../models/user.model.js"

const initializingPassport = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/users/oauth2/redirect/google',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if the user already exists in the database
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // If user doesn't exist, create a new one
            user = await User.create({
              googleId: profile.id,
              username: profile.name.givenName,
              password:profile.id,
              email: profile.emails[0].value,
              fullName: profile.displayName,
              avatar: profile.photos[0].value,
              refreshToken:refreshToken
            });
          }

          

          // console.log("registered user",user)

          // Proceed with authentication
          done(null, user);
        } catch (err) {
          done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

export default initializingPassport;
