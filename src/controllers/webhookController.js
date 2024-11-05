const User = require('../models/User');
const Profile = require('../models/Profile');

// Helper function to resolve a single select option to its text value
function resolveOption(value, fields) {
    const field = fields.find(f => f.value.includes(value[0]));
    return field ? field.options.find(option => option.id === value[0]).text : null;
}

// Helper function to resolve multiple select options to their text values
function resolveMultiSelectOptions(value, fields) {
    return value.map(val => {
        const field = fields.find(f => f.value.includes(val));
        return field ? field.options.find(option => option.id === val).text : null;
    }).filter(Boolean);
}

// Helper function to resolve the dropdown state selection
function resolveState(stateId, fields) {
    const stateField = fields.find(field => field.label === 'State');
    const stateOption = stateField.options.find(option => option.id === stateId[0]);
    return stateOption ? stateOption.text : null;
}

exports.registerUserFromTally = async (req, res) => {
    try {
        const fields = req.body.data.fields;

        // Extract data from the fields array
        const data = {};
        fields.forEach(field => {
            data[field.label] = field.value;
        });

        // Create or update the user in the database
        const user = await User.create({
            email: data['Email Address'],
            first_name: data['First Name'],
            last_name: data['Last Name'],
            password: 'dummyPassword'  // Generate a real password if needed
        });

        // Create or update the profile in the database
        await Profile.create({
            user_id: user.user_id,
            preferred_name: data['What is your Preferred Name?'],
            address: data['Mailing Address'],
            address_line_2: data['Line 2 (Optional)'],
            city: data['City'],
            state: resolveState(data['State'], fields),
            zip_code: data['Zip Code'],
            is_relocatable: data['Are you willing to relocate?'][0] === 'Yes',
            relocation_states: resolveMultiSelectOptions(data['Please select one or more states that you are considering for relocation'], fields),
            date_of_birth: data['Date of Birth'],
            phone_number: data['Mobile Phone Number'],
            school: data['High School or College where Culinary Classes were taken'],
            graduation_year: data['What is your Year of Graduation?'],
            transportation_mode: resolveOption(data['How will you get to work?'], fields),
            preferred_work_hours: data['How many hours do you want to work per week?'],
            available_time_slots: resolveMultiSelectOptions(data['Select one or more'], fields),
            weekend_availability: data['Are you available to work during the weekends?'][0] === 'Yes',
            current_job: data['Do you currently have a job?'][0] === 'Yes',
            current_employer: data['Where do you work?'],
            current_position: data['What is your current position?'],
            current_work_hours: data['How many hours do you work per week?'],
            past_job: data['Have you had a job in the past?'][0] === 'Yes',
            past_employer: data['Where did you work?'],
            past_position: data['What was your position?'],
            past_work_hours: data['How many hours did you work per week?'],
            resume_url: data['Please upload your Resume'] ? data['Please upload your Resume'][0].url : null,
            ready_to_work_now: data['Are you ready to work now?'][0] === 'Yes',
            work_start_date: data['When will you be ready to work?'],
            interests: resolveMultiSelectOptions(data['Select the option(s) that you are interested in'], fields),
            food_handlers_card: data['Do you have a Food Handlers Card?'][0] === 'Yes',
            food_handlers_card_url: data['Please upload your Food Handlers Card (Image or PDF)'] ? data['Please upload your Food Handlers Card (Image or PDF)'][0].url : null,
            servsafe_credential: data['Do you have ServSafe credentials?'][0] === 'Yes',
            culinary_years: data['How many years of Culinary Classes have you attended?']
        });

        res.status(200).send({ message: 'User and Profile created successfully' });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send({ message: 'An error occurred while processing the form data' });
    }
};
