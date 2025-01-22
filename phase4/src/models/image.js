const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config');

// Sequelize 인스턴스 생성
const sequelize = new Sequelize(config.database.name, config.database.user, config.database.password, {
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    dialectOptions: config.database.dialectOptions // SSL 옵션 추가
});

// 모델 정의
const Image = sequelize.define('Image', {
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vector: {
        type: DataTypes.ARRAY(DataTypes.FLOAT),
        allowNull: false,
    },
});

module.exports = { sequelize, Image };
