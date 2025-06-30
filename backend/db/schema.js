const { Model, DataTypes } = require('sequelize');
const sequelize = require("./database");

class Usuarios extends Model {}

Usuarios.init({
  email:         { type: DataTypes.STRING, allowNull: false, unique: true },
  username:      { type: DataTypes.STRING, allowNull: false, unique: true },
  password:      { type: DataTypes.STRING, allowNull: false },
  admin:         { type: DataTypes.TINYINT, defaultValue: 0 },
  first_name:    { type: DataTypes.STRING(100) },
  last_name:     { type: DataTypes.STRING(100) },
  maiden_name:   { type: DataTypes.STRING(100) },
  age:           { type: DataTypes.INTEGER },
  gender:        { type: DataTypes.ENUM('male','female','other') },
  phone:         { type: DataTypes.STRING(50) },
  birth_date:    { type: DataTypes.DATE },
  image_url:     { type: DataTypes.STRING(255) },
  blood_group:   { type: DataTypes.STRING(10) },
  height_cm:     { type: DataTypes.DECIMAL(6,2) },
  weight_kg:     { type: DataTypes.DECIMAL(6,2) },
  eye_color:     { type: DataTypes.STRING(50) },
  ip_address:    { type: DataTypes.STRING(45) },
  mac_address:   { type: DataTypes.STRING(20) },
  university:    { type: DataTypes.STRING(255) },
  ein:           { type: DataTypes.STRING(20) },
  ssn:           { type: DataTypes.STRING(20) },
  user_agent:    { type: DataTypes.TEXT },
  estado:        { type: DataTypes.STRING(5), defaultValue: 'F' }
}, {
  sequelize,
  timestamps: false,
  modelName: 'usuarios'
});

// Cabellos (1:1)
class Cabellos extends Model {}
Cabellos.init({
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: Usuarios, key: 'id' } },
  color:   { type: DataTypes.STRING(50) },
  type:    { type: DataTypes.STRING(50) }
}, {
  sequelize,
  timestamps: false,
  modelName: 'cabellos'
});

// Direcciones (1:N)
class Direcciones extends Model {}
Direcciones.init({
  user_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: Usuarios, key: 'id' } },
  address_line: { type: DataTypes.STRING(255) },
  city:         { type: DataTypes.STRING(100) },
  state:        { type: DataTypes.STRING(100) },
  state_code:   { type: DataTypes.STRING(10) },
  postal_code:  { type: DataTypes.STRING(20) },
  latitude:     { type: DataTypes.DECIMAL(10,7) },
  longitude:    { type: DataTypes.DECIMAL(10,7) },
  country:      { type: DataTypes.STRING(100) },
  type:         { type: DataTypes.STRING(50) }
}, {
  sequelize,
  timestamps: false,
  modelName: 'direcciones'
});

// InformacionBancaria (1:1)
class InformacionBancaria extends Model {}
InformacionBancaria.init({
  user_id:      { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: Usuarios, key: 'id' } },
  card_expire:  { type: DataTypes.STRING(10) },
  card_number:  { type: DataTypes.STRING(20) },
  card_type:    { type: DataTypes.STRING(50) },
  currency:     { type: DataTypes.STRING(10) },
  iban:         { type: DataTypes.STRING(50) }
}, {
  sequelize,
  timestamps: false,
  modelName: 'informacion_bancaria'
});

// InformacionCompania (1:1)
class InformacionCompania extends Model {}
InformacionCompania.init({
  user_id:      { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: Usuarios, key: 'id' } },
  department:   { type: DataTypes.STRING(100) },
  company_name: { type: DataTypes.STRING(255) },
  title:        { type: DataTypes.STRING(100) },
  address_line: { type: DataTypes.STRING(255) },
  city:         { type: DataTypes.STRING(100) },
  state:        { type: DataTypes.STRING(100) },
  state_code:   { type: DataTypes.STRING(10) },
  postal_code:  { type: DataTypes.STRING(20) },
  latitude:     { type: DataTypes.DECIMAL(10,7) },
  longitude:    { type: DataTypes.DECIMAL(10,7) },
  country:      { type: DataTypes.STRING(100) }
}, {
  sequelize,
  timestamps: false,
  modelName: 'informacion_compania'
});

// Criptomonedas (1:N)
class Criptomonedas extends Model {}
Criptomonedas.init({
  user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Usuarios, key: 'id' } },
  coin:    { type: DataTypes.STRING(50) },
  wallet:  { type: DataTypes.STRING(255) },
  network: { type: DataTypes.STRING(100) }
}, {
  sequelize,
  timestamps: false,
  modelName: 'criptomonedas'
});

class Colores extends Model {}

Colores.init({
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuarios,
            key: 'id'
        }
    },
    color_1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color_2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color_3: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color_4: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color_5: {
        type: DataTypes.STRING,
        allowNull: false
    },
    predeterminado: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
},{
    sequelize,
    timestamps: false,
    modelName: 'colores'
})

class Fuentes extends Model {}

Fuentes.init({
    id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Usuarios,
            key: 'id'
        }
    },
    fuente_1: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fuente_2: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tamano_1: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tamano_2: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tamano_3: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    predeterminado: {
        type: DataTypes.TINYINT,
        defaultValue: 0
    }
},{
    sequelize,
    timestamps: false,
    modelName: 'fuentes'
})


Colores.belongsTo(Usuarios, { foreignKey: 'id_usuario' });
Usuarios.hasMany(Colores, { foreignKey: 'id_usuario' });
Fuentes.belongsTo(Usuarios, { foreignKey: 'id_usuario' });
Usuarios.hasMany(Fuentes, { foreignKey: 'id_usuario' });

Usuarios.hasOne(Cabellos, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Cabellos.belongsTo(Usuarios, { foreignKey: 'user_id' });

Usuarios.hasMany(Direcciones, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Direcciones.belongsTo(Usuarios, { foreignKey: 'user_id' });

Usuarios.hasOne(InformacionBancaria, { foreignKey: 'user_id', onDelete: 'CASCADE' });
InformacionBancaria.belongsTo(Usuarios, { foreignKey: 'user_id' });

Usuarios.hasOne(InformacionCompania, { foreignKey: 'user_id', onDelete: 'CASCADE' });
InformacionCompania.belongsTo(Usuarios, { foreignKey: 'user_id' });

Usuarios.hasMany(Criptomonedas, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Criptomonedas.belongsTo(Usuarios, { foreignKey: 'user_id' });


module.exports = { Usuarios , Colores , Fuentes , Cabellos, Direcciones, InformacionBancaria, InformacionCompania, Criptomonedas };
