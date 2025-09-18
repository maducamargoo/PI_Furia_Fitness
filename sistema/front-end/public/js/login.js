document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const cpf = document.getElementById('cpf').value.trim();

    // Função para validar CPF
    function isValidCPF(cpf) {
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let sum = 0, rest;
        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        if (rest !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        rest = (sum * 10) % 11;
        if (rest === 10 || rest === 11) rest = 0;
        return rest === parseInt(cpf.substring(10, 11));
    }

    // Validação do CPF
    if (!isValidCPF(cpf)) {
        alert('Por favor, insira um CPF válido.');
        return;
    }

    try {
        // Primeiro, verifica se o CPF existe no banco de dados
        const checkResponse = await fetch('http://localhost:3000/verificar-cpf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf })
        });

        const checkData = await checkResponse.json();

        if (!checkData.success) {
            alert('CPF não cadastrado. Por favor, verifique seus dados.');
            document.getElementById('cpf').value = ''; // Limpa o campo
            return;
        }

        // Se o CPF existe, procede com o login
        const loginResponse = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cpf })
        });

        const loginData = await loginResponse.json();

        if (loginData.success) {
            alert('Login realizado com sucesso!');
            window.location.href = './relatorio.html';
        } else {
            alert('Erro ao realizar login. Por favor, tente novamente.');
            document.getElementById('cpf').value = ''; // Limpa o campo
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao verificar CPF. Tente novamente.');
    }
});