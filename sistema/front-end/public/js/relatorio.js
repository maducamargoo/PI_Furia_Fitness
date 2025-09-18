async function carregarRelatoriosAlunos() {
    try {
        const response = await fetch('http://localhost:3000/relatorios-alunos');

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        const alunos = await response.json();

        const tabelaBody = document.getElementById('tbody-relatorios');
        tabelaBody.innerHTML = '';

        alunos.forEach(aluno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.sobrenome}</td>
                <td>${aluno.cpf}</td>
            `;
            tabelaBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erro ao carregar os relatórios dos alunos:', error);
        alert('Erro ao carregar os relatórios.');
    }
}
