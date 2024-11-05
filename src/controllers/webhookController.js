const User = require('../models/User');
const Profile = require('../models/Profile');

// Helper functions omitted for brevity, use as previously defined

exports.registerUserFromTally = async (req, res) => {
    try {
        const fields = req.body.data.fields;
        const data = {};
        fields.forEach(field => {
            data[field.label] = field.value;
        });

        const user = await User.create({
            email: data['Email Address'],
            first_name: data['First Name'],
            last_name: data['Last Name'],
            password: 'dummyPassword'  // Replace with actual password handling
        });

        await Profile.create({
            user_id: user.user_id,
            preferred_name: data['What is your Preferred Name?'],
            // map the rest of the fields as discussed
        });

        res.status(200).send({ message: 'User and Profile created successfully' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send({ message: 'An error occurred while processing the form data' });
    }
};
