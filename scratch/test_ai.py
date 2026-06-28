import sys
import json
sys.path.append('backend')
from main import chamar_gemini_para_avaliacao

print("=== TESTE 1: REDAÇÃO FUGA AO TEMA (RECEITA DE BOLO) ===")
res_fuga = chamar_gemini_para_avaliacao(
    text="Para fazer um bolo de cenoura delicioso você precisa de três cenouras médias, quatro ovos, meia xícara de óleo e duas xícaras de açúcar. Bata tudo no liquidificador e depois misture a farinha de trigo. Leve ao forno pré-aquecido por quarenta minutos.",
    cargo="Polícia Federal - Agente da PF",
    topic="Os desafios da segurança pública na era cibernética e o combate às organizações criminosas transnacionais no Brasil."
)
print(json.dumps(res_fuga, indent=2, ensure_ascii=False))
