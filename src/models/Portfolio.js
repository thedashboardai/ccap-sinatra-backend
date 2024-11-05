const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Portfolio = sequelize.define('Portfolio', {
    portfolio_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'user_id'
        },
        onDelete: 'CASCADE'
    },
    file_name: DataTypes.STRING,
    file_url: DataTypes.STRING,
    description: DataTypes.TEXT
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Portfolio;
