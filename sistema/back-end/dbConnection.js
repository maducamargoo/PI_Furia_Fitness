import oracledb from 'oracledb';

async function initializeDB() {
    try {
        await oracledb.createPool({
            user: 'ADMIN',
            password: 'SeTe-7__oito',
            connectString: '(description=(retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1522)(host=adb.sa-saopaulo-1.oraclecloud.com))(connect_data=(service_name=g5c71d58093d91e_integrador_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))'
        });
        console.log('Conexão com o banco de dados estabelecida.');
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        throw err;  // lança o erro para ser tratado no server.js
    }
}

export { initializeDB };