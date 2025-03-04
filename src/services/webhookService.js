const pool = require('../config/db');
const { sendEmail } = require('../utils/emailUtil');
const bcrypt = require('bcrypt');
const admin = require('../utils/firebaseUtil');


async function handleTallyWebhook(requestBody) {
  try {
    console.log('Webhook Received:', JSON.stringify(requestBody, null, 2));

    let fields = null;

    if (requestBody.data && requestBody.data.fields) {
      fields = requestBody.data.fields;
    } else if (requestBody.fields) {
      fields = requestBody.fields;
    } else {
      console.error('Invalid webhook structure: Missing `data` or `fields`');
      throw new Error('Invalid webhook structure: Missing `data` or `fields`');
    }

    // Extract field values safely
    const extractField = (key) =>
      fields.find((field) => field.key === key)?.value || null;

    const extractDropdownValue = (key) => {
      const field = fields.find((field) => field.key === key);
      if (field && field.value && field.options) {
        return field.options.find((option) => option.id === field.value[0])?.text || null;
      }
      return null;
    };

    const firstName = extractField('question_e5d7RE');
    const lastName = extractField('question_ga4BX1');
    const preferredName = extractField('question_lBl9gB');
    const email = extractField('question_bZb1rZ');
    const mailingAddress = extractField('question_lao9Kv');
    const addressLine2 = extractField('question_RWX6vj');
    const city = extractField('question_o9raKx');
    const state = extractDropdownValue('question_GeNjXk');
    const zipCode = extractField('question_xrxPWJ');
    const phoneNumber = extractField('question_vXo8LD');
    const highSchool = extractField('question_Ar1MDz');
    const graduationYear = extractField('question_AzPbqW');

    const willingToRelocate = extractField('question_OQpedg')?.includes('5e61841e-5da0-4086-83c8-cd8e40c8c0d1') || false;
    const relocationStates = extractField('question_VpRBvy') || [];
    const hoursPerWeek = extractField('question_LDR4Yp');
    const workPreference = extractField('question_yMDOrp') || [];
    const currentJob = extractField('question_1WqQvl')?.includes('e9e79e76-2c0d-4d7b-948b-06e3206a5b46') || false;
    const currentEmployer = extractField('question_M1ojYA');
    const currentPosition = extractField('question_J15EDR');
    const currentWorkHours = extractField('question_gbK8Z4');
    const pastJob = extractField('question_yXV8vx')?.includes('18248ef5-79c8-4d7a-8153-e1c952c09efc') || false;
    const pastEmployer = extractField('question_X5Z6YY');
    const pastPosition = extractField('question_8N7b8P');
    const pastWorkHours = extractField('question_0VNqvj');

    const hasResume = extractField('question_zEP8J0')?.includes('754d75fa-865a-4d91-a699-8e971ec6672a') || false;
    const resumeUrl = extractField('question_5XWavE')?.[0]?.url || null;

    const readyToWork = extractField('question_dbBJjK')?.includes('e5fdcff6-43ff-4dc8-8b61-4d9aa6a598b3') || false;
    const foodHandlersCard = extractField('question_laJ8Wv')?.includes('0bcb5347-7170-4ab0-8e5e-55340b8259e7') || false;
    const foodHandlersCardUrl = extractField('question_a9jQYX')?.[0]?.url || null;
    const servsafeCredential = extractField('question_RWEqYj')?.includes('ac29e2dc-814f-46d2-b15a-2c66932b9805') || false;
    const culinaryClassYears = extractField('question_o9X8dx');
    const jobInterests = extractField('question_DqgRDZ') || [];

    const dummyPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(dummyPassword, 10);
    console.log('Firebase Admin Initialized:', admin.name);

    let firebaseUser;
    try {
      firebaseUser = await admin.auth().getUserByEmail(email);
      console.log(`Firebase User Exists: ${firebaseUser.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        firebaseUser = await admin.auth().createUser({
          email,
          password: dummyPassword,
          displayName: `${firstName} ${lastName}`,
        });
        console.log(`Firebase User Created: ${firebaseUser.uid}`);
      } else {
        console.error('Firebase Error:', error.message);
        throw new Error('Failed to create or fetch Firebase user');
      }
    }


    const userInsertQuery = `
      INSERT INTO users (email, first_name, last_name, preferred_name, mailing_address, address_line_2, city, state, zip_code, phone_number, high_school, graduation_year, password)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (email) DO UPDATE
      SET first_name = $2, last_name = $3, preferred_name = $4, mailing_address = $5, address_line_2 = $6, city = $7, state = $8, zip_code = $9, phone_number = $10, high_school = $11, graduation_year = $12, password = $13
      RETURNING id;
    `;

    const userResult = await pool.query(userInsertQuery, [
      email,
      firstName,
      lastName,
      preferredName,
      mailingAddress,
      addressLine2,
      city,
      state,
      zipCode,
      phoneNumber,
      highSchool,
      graduationYear,
      hashedPassword, 
    ]);

    const userId = userResult.rows[0].id;
    console.log(`User processed with ID: ${userId}`);

    const profileInsertQuery = `
      INSERT INTO profiles (user_id, willing_to_relocate, relocation_states, hours_per_week, work_preference, current_job, current_employer, current_position, current_work_hours, past_job, past_employer, past_position, past_work_hours, has_resume, resume_url, ready_to_work, food_handlers_card, food_handlers_card_url, servsafe_credential, culinary_class_years, job_interests)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (user_id) DO UPDATE
      SET willing_to_relocate = $2, relocation_states = $3, hours_per_week = $4, work_preference = $5, current_job = $6, current_employer = $7, current_position = $8, current_work_hours = $9, past_job = $10, past_employer = $11, past_position = $12, past_work_hours = $13, has_resume = $14, resume_url = $15, ready_to_work = $16, food_handlers_card = $17, food_handlers_card_url = $18, servsafe_credential = $19, culinary_class_years = $20, job_interests = $21;
    `;

    await pool.query(profileInsertQuery, [
      userId,
      willingToRelocate,
      relocationStates,
      hoursPerWeek,
      workPreference,
      currentJob,
      currentEmployer,
      currentPosition,
      currentWorkHours,
      pastJob,
      pastEmployer,
      pastPosition,
      pastWorkHours,
      hasResume,
      resumeUrl,
      readyToWork,
      foodHandlersCard,
      foodHandlersCardUrl,
      servsafeCredential,
      culinaryClassYears,
      jobInterests,
    ]);

    console.log(`Profile updated for User ID: ${userId}`);

    const emailText = `
    Hello ${firstName},

    Welcome to the platform! Use the following credentials to log in:

    Email: ${email}
    Password: ${dummyPassword}

    Please reset your password after logging in.

    Regards,
    Team
  `;

  await sendEmail(email, 'Welcome to the Platform', emailText);

    console.log(`Email sent to ${email}`);

  } catch (error) {
    console.error('Error handling webhook:', error.message);
    throw error;
  }
}

module.exports = { handleTallyWebhook };
