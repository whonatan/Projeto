 <script>

class APISimulada {
    constructor() {
        this.alunos = JSON.parse(localStorage.getItem('alunos')) || [];
        this.nextId = parseInt(localStorage.getItem('nextId')) || 1;
    }

    salvarDados() {
        localStorage.setItem('alunos', JSON.stringify(this.alunos));
        localStorage.setItem('nextId', this.nextId.toString());
    }

    async criarAluno(dadosAluno) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const matriculaExiste = this.alunos.some(aluno => aluno.matricula === dadosAluno.matricula);
                if (matriculaExiste) {
                    reject(new Error('Matrícula já existe'));
                    return;
                }

                const novoAluno = {
                    id: this.nextId++,
                    nome: dadosAluno.nome,
                    matricula: dadosAluno.matricula,
                    email: dadosAluno.email,
                    notas: []
                };

                this.alunos.push(novoAluno);
                this.salvarDados();
                resolve(novoAluno);
            }, 100);
        });
    }

    async obterAlunos() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([...this.alunos]);
            }, 50);
        });
    }

    async obterAlunoPorId(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const aluno = this.alunos.find(a => a.id === id);
                if (aluno) {
                    resolve({...aluno});
                } else {
                    reject(new Error('Aluno não encontrado'));
                }
            }, 50);
        });
    }

    async atualizarAluno(id, dadosAtualizados) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.alunos.findIndex(a => a.id === id);
                if (index !== -1) {
                    if (dadosAtualizados.matricula) {
                        const matriculaExiste = this.alunos.some(aluno => 
                            aluno.matricula === dadosAtualizados.matricula && aluno.id !== id
                        );
                        if (matriculaExiste) {
                            reject(new Error('Matrícula já existe'));
                            return;
                        }
                    }

                    this.alunos[index] = { ...this.alunos[index], ...dadosAtualizados };
                    this.salvarDados();
                    resolve(this.alunos[index]);
                } else {
                    reject(new Error('Aluno não encontrado'));
                }
            }, 100);
        });
    }

    async excluirAluno(id) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const index = this.alunos.findIndex(a => a.id === id);
                if (index !== -1) {
                    const alunoRemovido = this.alunos.splice(index, 1)[0];
                    this.salvarDados();
                    resolve(alunoRemovido);
                } else {
                    reject(new Error('Aluno não encontrado'));
                }
            }, 100);
        });
    }

    async adicionarNota(alunoId, nota) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const aluno = this.alunos.find(a => a.id === alunoId);
                if (aluno) {
                    const novaNota = {
                        id: Date.now(),
                        disciplina: nota.disciplina,
                        valor: nota.valor,
                        data: new Date().toISOString().split('T')[0]
                    };
                    aluno.notas.push(novaNota);
                    this.salvarDados();
                    resolve(novaNota);
                } else {
                    reject(new Error('Aluno não encontrado'));
                }
            }, 100);
        });
    }

    async removerNota(alunoId, notaId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const aluno = this.alunos.find(a => a.id === alunoId);
                if (aluno) {
                    const index = aluno.notas.findIndex(n => n.id === notaId);
                    if (index !== -1) {
                        const notaRemovida = aluno.notas.splice(index, 1)[0];
                        this.salvarDados();
                        resolve(notaRemovida);
                    } else {
                        reject(new Error('Nota não encontrada'));
                    }
                } else {
                    reject(new Error('Aluno não encontrado'));
                }
            }, 100);
        });
    }
}

class SistemaGerenciamentoAlunos {
    constructor() {
        this.api = new APISimulada();
        this.alunoSelecionado = null;
        this.inicializarEventListeners();
        this.carregarAlunos();
    }

    inicializarEventListeners() {
        // CORREÇÃO: Usar getElementById para pegar os formulários específicos
        const formCadastro = document.getElementById('formCadastro');
        formCadastro.addEventListener('submit', async (e) => {
            e.preventDefault(); // CORREÇÃO PRINCIPAL: Impede recarregamento
            
            const nome = document.getElementById('nome').value.trim();
            const matricula = document.getElementById('matricula').value.trim();
            const email = document.getElementById('email').value.trim();
            
            if (!nome || !matricula || !email) {
                this.mostrarMensagem('Preencha todos os campos!', 'erro');
                return;
            }
            
            try {
                await this.cadastrarAluno(nome, matricula, email);
                formCadastro.reset();
                this.mostrarMensagem('Aluno cadastrado com sucesso!', 'sucesso');
            } catch (error) {
                this.mostrarMensagem('Erro ao cadastrar aluno: ' + error.message, 'erro');
            }
        });

        // CORREÇÃO: Usar getElementById para o formulário de notas
        const formNota = document.getElementById('formNota');
        formNota.addEventListener('submit', async (e) => {
            e.preventDefault(); // CORREÇÃO PRINCIPAL: Impede recarregamento
            
            if (!this.alunoSelecionado) {
                this.mostrarMensagem('Selecione um aluno primeiro!', 'erro');
                return;
            }
            
            const disciplina = document.getElementById('disciplina').value.trim();
            const nota = parseFloat(document.getElementById('nota').value);
            
            if (!disciplina) {
                this.mostrarMensagem('Digite o nome da disciplina!', 'erro');
                return;
            }
            
            if (isNaN(nota) || nota < 0 || nota > 10) {
                this.mostrarMensagem('A nota deve ser um número entre 0 e 10!', 'erro');
                return;
            }
            
            try {
                await this.adicionarNota(disciplina, nota);
                formNota.reset();
                this.mostrarMensagem('Nota adicionada com sucesso!', 'sucesso');
            } catch (error) {
                this.mostrarMensagem('Erro ao adicionar nota: ' + error.message, 'erro');
            }
        });
    }

    async cadastrarAluno(nome, matricula, email) {
        try {
            await this.api.criarAluno({ nome, matricula, email });
            this.carregarAlunos();
        } catch (error) {
            throw error;
        }
    }

    async carregarAlunos() {
        try {
            const alunos = await this.api.obterAlunos();
            this.renderizarTabelaAlunos(alunos);
        } catch (error) {
            this.mostrarMensagem('Erro ao carregar alunos: ' + error.message, 'erro');
        }
    }

    renderizarTabelaAlunos(alunos) {
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';

        alunos.forEach(aluno => {
            const media = this.calcularMedia(aluno.notas);
            const row = tbody.insertRow();
            
            row.innerHTML = `
                <td>${aluno.nome}</td>
                <td>${aluno.matricula}</td>
                <td>${aluno.email}</td>
                <td>
                    <button type="button" onclick="sistema.selecionarAluno(${aluno.id})" style="margin: 2px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Selecionar</button>
                    <button type="button" onclick="sistema.editarAluno(${aluno.id})" style="margin: 2px; padding: 5px 10px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">Editar</button>
                    <button type="button" onclick="sistema.excluirAluno(${aluno.id})" style="margin: 2px; padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Excluir</button>
                </td>
            `;
        });
    }

    async selecionarAluno(id) {
        try {
            this.alunoSelecionado = await this.api.obterAlunoPorId(id);
            this.exibirDetalhesAluno();
            this.mostrarMensagem(`Aluno ${this.alunoSelecionado.nome} selecionado!`, 'sucesso');
        } catch (error) {
            this.mostrarMensagem('Erro ao selecionar aluno: ' + error.message, 'erro');
        }
    }

    exibirDetalhesAluno() {
        if (!this.alunoSelecionado) return;

        const media = this.calcularMedia(this.alunoSelecionado.notas);
        const detalhesSection = document.querySelector('section:last-of-type');
        
        let notasTexto = '';
        if (this.alunoSelecionado.notas.length > 0) {
            notasTexto = this.alunoSelecionado.notas.map(nota => 
                `${nota.disciplina}: ${nota.valor} (${nota.data}) <button type="button" onclick="sistema.removerNota(${nota.id})" style="margin-left: 10px; padding: 2px 6px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 12px;">Remover</button>`
            ).join('<br>');
        } else {
            notasTexto = 'Nenhuma nota cadastrada';
        }

        const paragrafos = detalhesSection.querySelectorAll('p');
        paragrafos[0].innerHTML = `<strong>Aluno Selecionado:</strong> ${this.alunoSelecionado.nome} (${this.alunoSelecionado.matricula})<br><strong>Notas:</strong><br>${notasTexto}`;
        paragrafos[1].innerHTML = `<strong>Média:</strong> ${media.toFixed(2)}`;
    }

    async adicionarNota(disciplina, valor) {
        try {
            await this.api.adicionarNota(this.alunoSelecionado.id, { disciplina, valor });
            this.alunoSelecionado = await this.api.obterAlunoPorId(this.alunoSelecionado.id);
            this.exibirDetalhesAluno();
            this.carregarAlunos();
        } catch (error) {
            throw error;
        }
    }

    async removerNota(notaId) {
        if (confirm('Tem certeza que deseja remover esta nota?')) {
            try {
                await this.api.removerNota(this.alunoSelecionado.id, notaId);
                this.alunoSelecionado = await this.api.obterAlunoPorId(this.alunoSelecionado.id);
                this.exibirDetalhesAluno();
                this.carregarAlunos();
                this.mostrarMensagem('Nota removida com sucesso!', 'sucesso');
            } catch (error) {
                this.mostrarMensagem('Erro ao remover nota: ' + error.message, 'erro');
            }
        }
    }

    async editarAluno(id) {
        try {
            const aluno = await this.api.obterAlunoPorId(id);
            
            const novoNome = prompt('Nome:', aluno.nome);
            if (novoNome === null) return;
            
            const novaMatricula = prompt('Matrícula:', aluno.matricula);
            if (novaMatricula === null) return;
            
            const novoEmail = prompt('Email:', aluno.email);
            if (novoEmail === null) return;

            if (!novoNome.trim() || !novaMatricula.trim() || !novoEmail.trim()) {
                this.mostrarMensagem('Todos os campos são obrigatórios', 'erro');
                return;
            }

            await this.api.atualizarAluno(id, {
                nome: novoNome.trim(),
                matricula: novaMatricula.trim(),
                email: novoEmail.trim()
            });

            this.carregarAlunos();
            
            if (this.alunoSelecionado && this.alunoSelecionado.id === id) {
                this.alunoSelecionado = await this.api.obterAlunoPorId(id);
                this.exibirDetalhesAluno();
            }
            
            this.mostrarMensagem('Aluno atualizado com sucesso!', 'sucesso');
        } catch (error) {
            this.mostrarMensagem('Erro ao editar aluno: ' + error.message, 'erro');
        }
    }

    async excluirAluno(id) {
        if (confirm('Tem certeza que deseja excluir este aluno? Todas as suas notas também serão removidas.')) {
            try {
                await this.api.excluirAluno(id);
                this.carregarAlunos();
                
                if (this.alunoSelecionado && this.alunoSelecionado.id === id) {
                    this.limparDetalhes();
                }
                
                this.mostrarMensagem('Aluno excluído com sucesso!', 'sucesso');
            } catch (error) {
                this.mostrarMensagem('Erro ao excluir aluno: ' + error.message, 'erro');
            }
        }
    }

    limparDetalhes() {
        this.alunoSelecionado = null;
        const detalhesSection = document.querySelector('section:last-of-type');
        const paragrafos = detalhesSection.querySelectorAll('p');
        paragrafos[0].innerHTML = '<strong>Notas:</strong> (Nenhuma nota selecionada)';
        paragrafos[1].innerHTML = '<strong>Média:</strong> -';
    }

    calcularMedia(notas) {
        if (notas.length === 0) return 0;
        const soma = notas.reduce((acc, nota) => acc + nota.valor, 0);
        return parseFloat((soma / notas.length).toFixed(2));
    }

    mostrarMensagem(mensagem, tipo) {
        const mensagemDiv = document.getElementById('mensagem');
        
        mensagemDiv.textContent = mensagem;
        mensagemDiv.style.cssText = `
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            font-weight: bold;
            text-align: center;
            ${tipo === 'sucesso' ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;

        setTimeout(() => {
            mensagemDiv.textContent = '';
            mensagemDiv.style.cssText = '';
        }, 3000);
    }
}

// Inicializar o sistema quando a página carregar
let sistema;
document.addEventListener('DOMContentLoaded', function() {
    sistema = new SistemaGerenciamentoAlunos();
});

</script>
