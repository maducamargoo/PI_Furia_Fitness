// public/js/cadastro.js
document.getElementById('cadastro-aluno').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const nome = document.getElementById("nome").value;
    const sobrenome = document.getElementById("sobrenome").value;
    const data_nasc = document.getElementById("data_nasc").value;
    const cpf = document.getElementById("cpf").value;
    const email = document.getElementById("email").value;
    const telefone = document.getElementById("telefone").value;
    const genero = document.getElementById("genero").value;
    const peso = document.getElementById("peso").value;
    const altura = document.getElementById("altura").value;

    const data = {
        nome: nome,
        sobrenome: sobrenome,
        data_nasc: data_nasc,
        cpf: cpf,
        email: email,
        telefone: telefone,
        genero: genero,
        peso: peso,
        altura: altura,
    };

    console.log('Dados do aluno:', data);

    try {
        const response = await fetch('http://localhost:3000/cadastrar-aluno', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        console.log(result);

        if (result.success) {
            alert('Cadastro realizado com sucesso!');
        } else {
            alert(result.message || 'Erro ao cadastrar aluno.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao cadastrar aluno.');
    }
});
