const supertest = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../index');

const api = supertest(app);

const loginUser = async () => {
    const response = await api
        .post('/auth/login')
        .send({
            email: 'erga916@vidalibarraquer.net',
            password: 'Admin1234@',
        });

    return response.body.token;
};

test('Crear, actualizar y eliminar usuario + Login', async () => {
    const newUser = {
        nom: 'Nombre de prueba',
        cognom: 'Apellido de prueba',
        email: 'erga920@vidalibarraquer.net',
        password: 'Admin1234@',
    }

    const registerResponse = await api
        .post('/auth/register')
        .send(newUser);
    const user = registerResponse.body.userData.userId;
    const token = registerResponse.body.token;

    const updatedUser = {
        nom: 'Nombre actualizado',
        cognom: 'Apellido actualizado',
        email: 'erga920@vidalibarraquer.net',
        currentPassword: 'Admin1234@',
        newPassword: 'NewPassword123@',
        dni: '48029917Y',
        especialitat: 'Especialidad de prueba',
    };

    await api
    .post(`/user/update/${user}`)
    .set('Authorization', `Bearer ${token}`)
    .send(updatedUser)
    .expect(200)
    .expect('Content-Type', /application\/json/);

    await api
        .post(`/user/delete/${user}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
});

test('Plantillas json', async () => {
    const token = await loginUser();

    await api
        .get('/plantillas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Crear, actualizar y eliminar plantilla', async () => {
    const token = await loginUser();
    const userResponse = await api
        .get('/auth/user')
        .set('Authorization', `Bearer ${token}`);
    const userId = userResponse.body._id;

    const newPlantilla = {
        nom: 'Plantilla de prueba',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        creador: userId
    };

    const createResponse = await api
        .post('/plantillas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newPlantilla)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const plantillaId = createResponse.body._id;

    const updatedPlantilla = {
        nom: 'Plantilla actualizada',
        puntsOrdreDia: ['Punto actualizado 1', 'Punto actualizado 2'],
        creador: userId
    };

    await api
        .post(`/plantillas/update/${plantillaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedPlantilla)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/plantillas/delete/${plantillaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Grupos json', async () => {
    const token = await loginUser();

    await api
        .get('/grups')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Crear, actualizar y eliminar grupo', async () => {
    const token = await loginUser();

    const userResponse = await api
        .get('/auth/user')
        .set('Authorization', `Bearer ${token}`);
    const userId = userResponse.body._id;

    const newGrup = {
        nom: 'Grupo de prueba',
        tipus: 'Privat',
        membres: [],
        creador: userId
    };

    const createResponse = await api
        .post('/grups/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newGrup)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const grupId = createResponse.body.newGrup._id;

    const updatedGrup = {
        nom: 'Grupo actualizado',
        tipus: 'Públic',
        membres: [],
        creador: userId
    };

    await api
        .post(`/grups/update/${grupId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedGrup)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/grups/delete/${grupId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Convocatorias json', async () => {
    const token = await loginUser();

    await api
        .get('/convocatorias')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Crear, actualizar y eliminar convocatoria', async () => {
    const token = await loginUser();
    const userResponse = await api
        .get('/auth/user')
        .set('Authorization', `Bearer ${token}`);
    const userId = userResponse.body._id;

    const newPlantilla = {
        nom: 'Plantilla de prueba',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        creador: userId
    };

    const createResponsePlantilla = await api
        .post('/plantillas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newPlantilla)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const plantillaId = createResponsePlantilla.body._id;

    const newGrup = {
        nom: 'Grupo de prueba',
        tipus: 'Privat',
        membres: [],
        creador: userId
    };

    const createResponseGrupo = await api
        .post('/grups/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newGrup)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const grupId = createResponseGrupo.body.newGrup._id;

    const newConvocatoria = {
        nom: 'Convocatoria de prueba',
        data: new Date(),
        horaInici: '10:00',
        durada: 120,
        lloc: 'Sala de reuniones',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        convocats: [grupId],
        plantilla: plantillaId,
        responsable: userId,
        creador: userId
    };

    const createResponse = await api
        .post('/convocatorias/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newConvocatoria)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    const convocatoriaId = createResponse.body.newConvocatoria._id;

    const updatedConvocatoria = {
        nom: 'Convocatoria actualizada',
        data: new Date(),
        horaInici: '11:00',
        durada: 130,
        lloc: 'Sala de conferencias',
        puntsOrdreDia: ['Punto actualizado 1', 'Punto actualizado 2'],
        convocats: [grupId],
        plantilla: plantillaId,
        responsable: userId,
        creador: userId
    };

    await api
        .post(`/convocatorias/update/${convocatoriaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedConvocatoria)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/plantillas/delete/${plantillaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/grups/delete/${grupId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/convocatorias/delete/${convocatoriaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Actas json', async () => {
    const token = await loginUser();

    await api
        .get('/actas')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Crear, actualizar y eliminar acta', async () => {
    const token = await loginUser();
    const userResponse = await api
        .get('/auth/user')
        .set('Authorization', `Bearer ${token}`);
    const userId = userResponse.body._id;

    const newGrup = {
        nom: 'Grupo de prueba',
        tipus: 'Privat',
        membres: [],
        creador: userId
    };

    const createResponseGrupo = await api
        .post('/grups/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newGrup)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const grupId = createResponseGrupo.body.newGrup._id;

    const newPlantilla = {
        nom: 'Plantilla de prueba',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        creador: userId
    };

    const createResponsePlantilla = await api
        .post('/plantillas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newPlantilla)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const plantillaId = createResponsePlantilla.body._id;

    const newConvocatoria = {
        nom: 'Convocatoria de prueba',
        data: new Date(),
        horaInici: '10:00',
        durada: 120,
        lloc: 'Sala de reuniones',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        convocats: [grupId],
        plantilla: plantillaId,
        responsable: userId,
        creador: userId
    };

    const createResponseConvocatoria = await api
        .post('/convocatorias/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newConvocatoria)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    const convocatoriaId = createResponseConvocatoria.body.newConvocatoria._id;

    const newActa = {
        nom: 'Acta de prueba',
        estat: 'Oberta',
        descripcions: ['Descripción 1', 'Descripción 2'],
        convocatoria: convocatoriaId,
        acords: [],
        creador: userId,
        assistents: []
    };

    const createResponse = await api
        .post('/actas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newActa)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const actaId = createResponse.body._id;

    const updatedActa = {
        nom: 'Acta actualizada',
        estat: 'Tancada',
        descripcions: ['Descripción actualizada 1', 'Descripción actualizada 2'],
        convocatoria: convocatoriaId,
        acords: [],
        creador: userId,
        assistents: []
    };

    await api
        .post(`/actas/update/${actaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedActa)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/plantillas/delete/${plantillaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/grups/delete/${grupId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/convocatorias/delete/${convocatoriaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/actas/delete/${actaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Acuerdos json', async () => {
    const token = await loginUser();

    await api
        .get('/acords')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

test('Crear, actualizar y eliminar acuerdo', async () => {
    const token = await loginUser();
    const userResponse = await api
        .get('/auth/user')
        .set('Authorization', `Bearer ${token}`);
    const userId = userResponse.body._id;

    const newPlantilla = {
        nom: 'Plantilla de prueba',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        creador: userId
    };

    const createResponsePlantilla = await api
        .post('/plantillas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newPlantilla)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const plantillaId = createResponsePlantilla.body._id;

    const newGrup = {
        nom: 'Grupo de prueba',
        tipus: 'Privat',
        membres: [],
        creador: userId
    };

    const createResponseGrupo = await api
        .post('/grups/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newGrup)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const grupId = createResponseGrupo.body.newGrup._id;

    const newConvocatoria = {
        nom: 'Convocatoria de prueba',
        data: new Date(),
        horaInici: '10:00',
        durada: 120,
        lloc: 'Sala de reuniones',
        puntsOrdreDia: ['Punto 1', 'Punto 2'],
        convocats: [grupId],
        plantilla: plantillaId,
        responsable: userId,
        creador: userId
    };

    const createResponseConvocatoria = await api
        .post('/convocatorias/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newConvocatoria)
        .expect(200)
        .expect('Content-Type', /application\/json/);
    const convocatoriaId = createResponseConvocatoria.body.newConvocatoria._id;

    const newActa = {
        nom: 'Acta de prueba',
        estat: 'Oberta',
        descripcions: ['Descripción 1', 'Descripción 2'],
        convocatoria: convocatoriaId,
        acords: [],
        creador: userId,
        assistents: []
    };

    const createResponseActa = await api
        .post('/actas/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newActa)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const actaId = createResponseActa.body._id;

    const newAcord = {
        nom: 'Acuerdo de prueba',
        dataInici: new Date(),
        dataFinal: new Date(),
        descripcio: 'Descripción del acuerdo',
        acta: actaId,
        creador: userId
    };

    const createResponse = await api
        .post('/acords/create')
        .set('Authorization', `Bearer ${token}`)
        .send(newAcord)
        .expect(201)
        .expect('Content-Type', /application\/json/);
    const acordId = createResponse.body._id;

    const updatedAcord = {
        nom: 'Acuerdo actualizado',
        dataInici: new Date(),
        dataFinal: new Date(),
        descripcio: 'Descripción del acuerdo actualizado',
        acta: actaId,
        creador: userId
    };

    await api
        .post(`/acords/update/${acordId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedAcord)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/plantillas/delete/${plantillaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/grups/delete/${grupId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/convocatorias/delete/${convocatoriaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/actas/delete/${actaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

    await api
        .post(`/acords/delete/${acordId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
});

afterAll(() => {
    mongoose.connection.close();
    server.close();
})
