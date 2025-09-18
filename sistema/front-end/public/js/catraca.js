// Registrar o evento de clique para o botão de entrada
document.getElementById('btn-entrada').addEventListener('click', () => {
    const cpf = document.getElementById('cpf').value.trim();
    const tipo = 'entrada';
    Validarcpf(cpf, tipo); // Chama a função para registrar a entrada do aluno
});

// Registrar o evento de clique para o botão de saída
document.getElementById('btn-saida').addEventListener('click', () => {
    const cpf = document.getElementById('cpf').value.trim();
    const tipo = 'saida';
    Validarcpf(cpf, tipo); // Chama a função para registrar a saída do aluno
});

// Função responsável por enviar a requisição de entrada ou saída para o servidor
async function Validarcpf(cpf, tipo) {
    // Valida o formato do CPF (11 dígitos numéricos)
    if (!/^\d{11}$/.test(cpf)) {
        alert('CPF inválido');
        return;
    }

    try {
        // Envia uma requisição POST para a API com o CPF e tipo (entrada ou saída)
        const response = await fetch(`http://localhost:3000/cadastro-catraca`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf, tipo })
        });

        const result = await response.json(); // Converte a resposta da API em JSON
            console.log(result);

        // Exibe a mensagem de sucesso ou erro de acordo com a resposta da API
        if (result.success && tipo==='entrada') {
            alert('Sessão iniciada, tenha um bom treino!');
        } else if (result.success && tipo==='saida') {
            alert('Sessão encerrada, obrigado por utilizar a Furia Fitness!')
        } else {
            alert(result.message || 'Erro de registro.');
        }
    } catch (error) {
        console.error('Erro:', error); // Exibe erro no console em caso de falha na requisição
        alert('Erro ao registrar acesso. Tente novamente mais tarde.'); // Alerta ao usuário sobre o erro
    }
}