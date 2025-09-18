// Função para carregar os relatórios dos alunos
async function carregarRelatoriosAlunos() {
    try {
        const response = await fetch('http://localhost:3000/relatorios-alunos');
        const alunos = await response.json();

        const tabelaBody = document.getElementById('tbody-relatorios');
        tabelaBody.innerHTML = '';

        alunos.forEach(aluno => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.sobrenome}</td>
                <td>${aluno.cpf}</td>
                <td>${aluno.data_nasc}</td>
                <td>${aluno.email}</td>
                <td>${aluno.telefone}</td>
                <td>${aluno.genero}</td>
                <td>${aluno.peso}</td>
                <td>${aluno.altura}</td>
            `;
            tabelaBody.appendChild(row);
        });
    } catch (error) {

    }
}

// Carregar os dados ao abrir a página
document.addEventListener('DOMContentLoaded', carregarRelatoriosAlunos);
