
CREATE TABLE Aluno (
    Cpf VARCHAR2(11) PRIMARY KEY,
    Nome VARCHAR2(50) NOT NULL,
    Sobrenome VARCHAR2(50) NOT NULL,
    Data_nasc DATE NOT NULL,
    Email VARCHAR2(100) UNIQUE,
    Telefone VARCHAR2(15) NOT NULL,
    peso NUMBER(5),
    altura DECIMAL(5,2),
    Genero CHAR(1)
);
 

CREATE TABLE Secao (
    cod INT PRIMARY KEY,
    entrada_saida CHAR(1) NOT NULL,
    data_hora TIMESTAMP NOT NULL,
    cpf_aluno INT NOT NULL,
    FOREIGN KEY (cpf_aluno) REFERENCES aluno(cpf)
);

INSERT INTO Sessao (entrada_Saida, data_Hora, cpf_Aluno) VALUES ('S', CURRENT_TIMESTAMP, '48894943836');
--INSERT INTO Sessao (Entrada_Saida, Data_Hora, Cpf_Aluno) VALUES ('E/S', CURRENT_TIMESTAMP, 'Cpf_Aluno')
 
-- Criar sequencia para o Cod
CREATE SEQUENCE sessao_cod START WITH 1 INCREMENT BY 1;

-- Criar trigger para inserir Cod automaticamente
CREATE OR REPLACE TRIGGER trg_sessao_cod
BEFORE INSERT ON sessao
FOR EACH ROW
BEGIN
    :NEW.cod := sessao_cod.NEXTVAL;
END;


 
WITH sessao_completa AS (
    SELECT 
        s1.cpf_aluno,
        EXTRACT(HOUR FROM (s2.data_hora - s1.data_hora)) + 
        EXTRACT(MINUTE FROM (s2.data_hora - s1.data_hora)) / 60 AS duracao
    FROM 
        sessao s1
    JOIN 
        sessao s2 ON s1.cpf_aluno = s2.cpf_aluno 
                  AND s1.entrada_saida = 'E' 
                  AND s2.entrada_saida = 'S'
                  AND s2.data_hora > s1.data_hora
    WHERE 
        s1.data_hora >= TRUNC(SYSDATE, 'IW')  -- Garante que as seções pertencem a mesma semana
        AND NOT EXISTS (
            SELECT 1 FROM sessao s3 
            WHERE s3.cpf_aluno = s1.cpf_aluno 
              AND s3.entrada_saida = 'E' 
              AND s3.data_hora > s1.data_hora 
              AND s3.data_hora < s2.data_hora
        )  -- Certificando que a data de entrada e saida pertencem a mesma secao
),
presenca_semanal AS (
    SELECT 
        a.cpf,
        a.nome,
        a.sobrenome,
        COALESCE(SUM(sc.duracao), 0) AS hora_semanais -- Em caso do aluno não possuir presença, o valor null é transformado em númerico
    FROM 
        aluno a
    LEFT JOIN 
        sessao_Completa sc ON a.cpf = sc.cpf_aluno
    GROUP BY 
        a.cpf, a.nome, a.sobrenome
)
SELECT 
    cpf,
    nome,
    sobrenome,
    hora_semanais,
    CASE
        WHEN hora_semanais > 20 THEN 'Extremamente avançado'
        WHEN hora_semanais > 10 THEN 'Avançado'
        WHEN hora_semanais > 5 THEN 'Intermediário'
        ELSE 'Iniciante'
    END AS Classificao
FROM 
    presenca_semanal
ORDER BY 
    nome;


INSERT INTO Aluno (Cpf, Nome, Sobrenome, Data_nasc, Email, Telefone, peso, altura, Genero) VALUES
('12345678901', 'João', 'Silva', TO_DATE('1990-05-10', 'YYYY-MM-DD'), 'joao.silva@example.com', '11987654321', 75, 1.80, 'M'),
('23456789012', 'Maria', 'Oliveira', TO_DATE('1992-07-22', 'YYYY-MM-DD'), 'maria.oliveira@example.com', '11976543210', 65, 1.65, 'F'),
('34567890123', 'Carlos', 'Pereira', TO_DATE('1985-03-14', 'YYYY-MM-DD'), 'carlos.pereira@example.com', '11965432109', 85, 1.75, 'M'),
('45678901234', 'Ana', 'Costa', TO_DATE('1993-08-05', 'YYYY-MM-DD'), 'ana.costa@example.com', '11954321098', 55, 1.60, 'F'),
('56789012345', 'Ricardo', 'Santos', TO_DATE('1988-11-30', 'YYYY-MM-DD'), 'ricardo.santos@example.com', '11943210987', 90, 1.85, 'M'),
('67890123456', 'Fernanda', 'Moraes', TO_DATE('1996-01-15', 'YYYY-MM-DD'), 'fernanda.moraes@example.com', '11932109876', 68, 1.70, 'F'),
('78901234567', 'Lucas', 'Lima', TO_DATE('1991-12-25', 'YYYY-MM-DD'), 'lucas.lima@example.com', '11921098765', 78, 1.80, 'M'),
('89012345678', 'Juliana', 'Almeida', TO_DATE('1994-04-10', 'YYYY-MM-DD'), 'juliana.almeida@example.com', '11910987654', 63, 1.68, 'F'),
('90123456789', 'Marcos', 'Nascimento', TO_DATE('1987-09-20', 'YYYY-MM-DD'), 'marcos.nascimento@example.com', '11909876543', 80, 1.77, 'M'),
('01234567890', 'Patrícia', 'Cardoso', TO_DATE('1995-02-03', 'YYYY-MM-DD'), 'patricia.cardoso@example.com', '11998765432', 70, 1.72, 'F');