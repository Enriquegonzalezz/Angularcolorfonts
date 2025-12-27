const sequelize = require('./db/database');
const { Usuarios } = require('./db/schema');
const bcrypt = require('bcrypt');

async function createAdminUser() {
  try {
    console.log('🔍 Verificando si existe un usuario administrador...');
    
    // Verificar si ya existe un usuario administrador
    const existingAdmin = await Usuarios.findOne({
      where: { admin: 1 }
    });
    
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe:', existingAdmin.username);
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Admin: ${existingAdmin.admin === 1 ? 'Sí' : 'No'}`);
      return existingAdmin;
    }
    
    // Crear usuario administrador por defecto
    console.log('📝 Creando usuario administrador por defecto...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await Usuarios.create({
      email: 'admin@example.com',
      username: 'admin',
      password: hashedPassword,
      admin: 1,
      estado: 'V'
    });
    
    console.log('✅ Usuario administrador creado exitosamente:');
    console.log(`   ID: ${adminUser.id}`);
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Admin: ${adminUser.admin === 1 ? 'Sí' : 'No'}`);
    console.log('\n🔑 Credenciales de acceso:');
    console.log(`   Email: admin@example.com`);
    console.log(`   Password: admin123`);
    
    return adminUser;
    
  } catch (error) {
    console.error('❌ Error creando usuario administrador:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar la creación del usuario administrador
createAdminUser();
