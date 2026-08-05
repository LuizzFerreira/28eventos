-- =============================================
-- 28 Eventos - Seed de Produtos para Teste
-- =============================================
-- Execute este arquivo no Supabase SQL Editor
-- As categorias já devem estar inseridas (schema.sql)

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'DJ Profissional', 'DJ com equipamento completo: 🔊 2 Caixas de Som 🎤 2 Microfones para Discursos e Interações 💡 Luzes de Boate 💨 Máquina de Fumaça', 1800.00, id, true, true
from public.categorias where nome = 'DJ';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'DJ Premium', 'DJ com setup completo, controladora profissional, cabine personalizada e até 5h. Rider técnico incluso.', 3200.00, id, true, false
from public.categorias where nome = 'DJ';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Fotografia Completa', 'Cobertura fotográfica completa do evento com entrega de álbum digital em alta resolução. Até 6h.', 2200.00, id, true, true
from public.categorias where nome = 'Fotografia';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Foto + Vídeo', 'Pacote completo com fotógrafo e cinegrafista. Entrega de álbum digital e vídeo editado em até 30 dias.', 4500.00, id, true, true
from public.categorias where nome = 'Fotografia';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Filmagem Profissional', 'Filmagem completa com câmera 4K, drone e edição cinematográfica. Entrega em até 45 dias.', 2800.00, id, true, false
from public.categorias where nome = 'Filmagem';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Cabine de Fotos', 'Cabine de fotos divertida com impressão instantânea, props temáticos e álbum digital. Até 4h.', 1200.00, id, true, true
from public.categorias where nome = 'Cabine de Fotos';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Foto 360°', 'Plataforma giratória 360° com câmera de alta velocidade e software de edição. Inclui operador.', 1500.00, id, true, true
from public.categorias where nome = 'Foto 360°';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Robô de LED', 'Robô de LED interativo com operador, ideal para festas e eventos corporativos. Até 4h.', 2500.00, id, true, true
from public.categorias where nome = 'Robô de LED';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Painel de LED 3x2m', 'Painel de LED indoor 3x2 metros, resolução P3, ideal para apresentações e transmissões.', 1800.00, id, true, false
from public.categorias where nome = 'Painel de LED';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Som Básico', 'Sistema de som com 2 caixas ativas, mesa de som e microfone. Ideal para eventos de até 100 pessoas.', 800.00, id, true, false
from public.categorias where nome = 'Som';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Som Completo', 'Sistema line array com subwoofers, mesa digital e técnico de som. Eventos de até 500 pessoas.', 2400.00, id, true, false
from public.categorias where nome = 'Som';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Iluminação Festa', 'Kit iluminação com moving heads, strobo, laser e controlador DMX. Inclui técnico.', 1600.00, id, true, true
from public.categorias where nome = 'Iluminação';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Moving Heads 8un', '8 moving heads beam profissionais com programação personalizada para o evento.', 2000.00, id, true, false
from public.categorias where nome = 'Moving Heads';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Máquina de Fumaça', 'Máquina de fumaça de baixo com efeito neve seca. Ideal para entrada de noivos e debutantes.', 600.00, id, true, false
from public.categorias where nome = 'Máquina de Fumaça';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Sky Paper', 'Lançador de papel picado colorido com efeito especial. Pacote com 4 lançamentos.', 400.00, id, true, false
from public.categorias where nome = 'Sky Paper';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Pista de LED', 'Pista de dança com LED RGB programável, 20m². Inclui montagem e desmontagem.', 3500.00, id, true, true
from public.categorias where nome = 'Pista de LED';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Decoração Completa', 'Decoração temática completa com flores, arranjos, mesa do bolo e painel de fundo. Consulte temas.', 5000.00, id, true, true
from public.categorias where nome = 'Decoração';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Decoração Básica', 'Decoração com balões, mesa do bolo e painel simples. Ideal para festas menores.', 1500.00, id, true, false
from public.categorias where nome = 'Decoração';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Cerimonial Completo', 'Cerimonialista para planejamento e execução completa do evento. Do briefing ao encerramento.', 4000.00, id, true, true
from public.categorias where nome = 'Cerimonial';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Bartender', 'Bartender profissional com kit de drinks, coquetéis e drinks sem álcool. Até 5h.', 900.00, id, true, false
from public.categorias where nome = 'Bartender';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Open Bar Completo', 'Open bar com bebidas nacionais e importadas, bartender e garçons. Por pessoa/hora.', 120.00, id, true, true
from public.categorias where nome = 'Open Bar';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Buffet por Pessoa', 'Buffet completo com entrada, prato principal, sobremesa e bebidas não alcoólicas. Por pessoa.', 95.00, id, true, false
from public.categorias where nome = 'Buffet';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Drone Filmagem', 'Filmagem aérea com drone DJI, piloto certificado ANAC. Até 2h de voo.', 1200.00, id, true, false
from public.categorias where nome = 'Drone';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Transmissão ao Vivo', 'Transmissão ao vivo para YouTube/Instagram com câmera dedicada e operador. Até 4h.', 1400.00, id, true, false
from public.categorias where nome = 'Transmissão ao Vivo';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Tenda 10x10m', 'Tenda piramidal 10x10m com laterais. Ideal para eventos ao ar livre.', 2200.00, id, true, false
from public.categorias where nome = 'Tenda';

insert into public.produtos (nome, descricao, preco, categoria_id, ativo, destaque)
select 'Gerador 100kVA', 'Gerador silenciado 100kVA com técnico. Garante energia para todo o evento.', 1800.00, id, true, false
from public.categorias where nome = 'Gerador';
