const express = require('express');
const pool = require('../config/db');
const authenticateJWT = require('../middleware/authenticateJWT');

const router = express.Router();

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user; 

    const userQuery = `
      SELECT u.email, u.first_name, u.last_name, u.preferred_name, 
             u.mailing_address, u.address_line_2, u.city, u.state, u.zip_code, 
             u.phone_number, u.high_school, u.graduation_year, 
             p.willing_to_relocate, p.relocation_states, p.hours_per_week, 
             p.work_preference, p.current_job, p.current_employer, 
             p.current_position, p.current_work_hours, p.past_job, 
             p.past_employer, p.past_position, p.past_work_hours, 
             p.has_resume, p.resume_url, p.ready_to_work, 
             p.food_handlers_card, p.food_handlers_card_url, 
             p.servsafe_credential, p.culinary_class_years, 
             p.job_interests
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.email = $1
    `;

    const userResult = await pool.query(userQuery, [email]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/update', authenticateJWT, async (req, res) => {
  try {
    const { email } = req.user; 
    const {
      first_name,
      last_name,
      preferred_name,
      mailing_address,
      address_line_2,
      city,
      state,
      zip_code,
      phone_number,
      high_school,
      graduation_year,
      willing_to_relocate,
      relocation_states,
      hours_per_week,
      work_preference,
      current_job,
      current_employer,
      current_position,
      current_work_hours,
      past_job,
      past_employer,
      past_position,
      past_work_hours,
      has_resume,
      resume_url,
      ready_to_work,
      food_handlers_card,
      food_handlers_card_url,
      servsafe_credential,
      culinary_class_years,
      job_interests,
    } = req.body;

    const updateUserQuery = `
      UPDATE users
      SET first_name = $1, last_name = $2, preferred_name = $3, 
          mailing_address = $4, address_line_2 = $5, city = $6, 
          state = $7, zip_code = $8, phone_number = $9, 
          high_school = $10, graduation_year = $11
      WHERE email = $12
      RETURNING id;
    `;

    const userResult = await pool.query(updateUserQuery, [
      first_name,
      last_name,
      preferred_name,
      mailing_address,
      address_line_2,
      city,
      state,
      zip_code,
      phone_number,
      high_school,
      graduation_year,
      email,
    ]);

    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userId = userResult.rows[0].id;

    const updateProfileQuery = `
      INSERT INTO profiles (user_id, willing_to_relocate, relocation_states, 
                            hours_per_week, work_preference, current_job, 
                            current_employer, current_position, 
                            current_work_hours, past_job, past_employer, 
                            past_position, past_work_hours, has_resume, 
                            resume_url, ready_to_work, food_handlers_card, 
                            food_handlers_card_url, servsafe_credential, 
                            culinary_class_years, job_interests)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 
              $15, $16, $17, $18, $19, $20, $21)
      ON CONFLICT (user_id) DO UPDATE
      SET willing_to_relocate = $2, relocation_states = $3, 
          hours_per_week = $4, work_preference = $5, current_job = $6, 
          current_employer = $7, current_position = $8, 
          current_work_hours = $9, past_job = $10, past_employer = $11, 
          past_position = $12, past_work_hours = $13, has_resume = $14, 
          resume_url = $15, ready_to_work = $16, food_handlers_card = $17, 
          food_handlers_card_url = $18, servsafe_credential = $19, 
          culinary_class_years = $20, job_interests = $21;
    `;

    await pool.query(updateProfileQuery, [
      userId,
      willing_to_relocate,
      relocation_states,
      hours_per_week,
      work_preference,
      current_job,
      current_employer,
      current_position,
      current_work_hours,
      past_job,
      past_employer,
      past_position,
      past_work_hours,
      has_resume,
      resume_url,
      ready_to_work,
      food_handlers_card,
      food_handlers_card_url,
      servsafe_credential,
      culinary_class_years,
      job_interests,
    ]);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
