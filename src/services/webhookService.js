// src/services/webhookService.js
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const emailUtil = require('../utils/emailUtil'); // For sending emails

exports.processTallyFormData = async (formData) => {
    print("FORM DATA", formData)
    // Extract data from formData
    const { email, first_name, last_name, preferred_name, address, date_of_birth, phone_number, education, year_of_graduation, current_position, preferred_work_hours, available_hours, is_available_on_weekends, years_of_experience } = formData;

    // Generate a dummy password
    const dummyPassword = uuidv4(); // Or use any password generator
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);

    // Create a new user entry in the database
    const newUser = await User.create({
        user_id: uuidv4(),
        email,
        password: hashedPassword,
        first_name,
        last_name,
    });

    // Create a profile entry linked to the user
    await Profile.create({
        profile_id: uuidv4(),
        user_id: newUser.user_id,
        preferred_name,
        address,
        date_of_birth,
        phone_number,
        education,
        year_of_graduation,
        current_position,
        preferred_work_hours,
        available_hours,
        is_available_on_weekends,
        years_of_experience
    });

    // Send a welcome email to the user with the dummy password
    await emailUtil.sendWelcomeEmail(email, dummyPassword);
};
