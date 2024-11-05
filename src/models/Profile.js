const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
    profile_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: { type: DataTypes.UUID, references: { model: 'User', key: 'user_id' } },
    preferred_name: DataTypes.STRING,
    address: DataTypes.STRING,
    address_line_2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zip_code: DataTypes.STRING,
    is_relocatable: DataTypes.BOOLEAN,
    relocation_states: DataTypes.ARRAY(DataTypes.STRING),
    date_of_birth: DataTypes.DATE,
    phone_number: DataTypes.STRING,
    school: DataTypes.STRING,
    graduation_year: DataTypes.INTEGER,
    transportation_mode: DataTypes.STRING,
    preferred_work_hours: DataTypes.INTEGER,
    available_time_slots: DataTypes.ARRAY(DataTypes.STRING),
    weekend_availability: DataTypes.BOOLEAN,
    current_job: DataTypes.BOOLEAN,
    current_employer: DataTypes.STRING,
    current_position: DataTypes.STRING,
    current_work_hours: DataTypes.INTEGER,
    past_job: DataTypes.BOOLEAN,
    past_employer: DataTypes.STRING,
    past_position: DataTypes.STRING,
    past_work_hours: DataTypes.INTEGER,
    resume_url: DataTypes.TEXT,
    ready_to_work_now: DataTypes.BOOLEAN,
    work_start_date: DataTypes.DATE,
    interests: DataTypes.ARRAY(DataTypes.STRING),
    food_handlers_card: DataTypes.BOOLEAN,
    food_handlers_card_url: DataTypes.TEXT,
    servsafe_credential: DataTypes.BOOLEAN,
    culinary_years: DataTypes.INTEGER
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Profile;
