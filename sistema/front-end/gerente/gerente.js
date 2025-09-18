// Função para carregar os relatórios dos alunos
async function carregarRelatoriosAlunos() {
    try {
        const response = await fetch('http://localhost:3000/relatorios-alunos');
        const alunos = await response.json();

        const tabelaBody = document.getElementById('tbody-relatorios');
        tabelaBody.innerHTML = '';

        alunos.forEach(aluno => {
            const row = document.createElement('tr');
            // Corrigido o uso do template literal
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

// Carregar os dados ao abrir a página
document.addEventListener('DOMContentLoaded', carregarRelatoriosAlunos);
