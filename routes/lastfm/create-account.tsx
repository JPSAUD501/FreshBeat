import { Head } from '$fresh/runtime.ts'

export default function CreateAccount() {
  return (
    <div class="min-h-screen bg-base-200 flex flex-col items-center py-10">
      <Head>
        <title>Como Criar uma Conta no Last.fm</title>
      </Head>
      <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-4 text-center">
          Como Criar uma Conta no Last.fm
        </h1>

        {/* Passo 1 */}
        <div class="step-container mb-8">
          <h2 class="text-xl font-semibold">Passo 1: Acesse o site Last.fm</h2>
          <p class="text-gray-600 mb-2">
            Visite o site oficial do Last.fm e clique no botão de registro.
          </p>
          <img
            src="https://via.placeholder.com/400x200"
            alt="Placeholder para o passo 1"
            class="w-full rounded-lg"
          />
        </div>

        {/* Passo 2 */}
        <div class="step-container mb-8">
          <h2 class="text-xl font-semibold">Passo 2: Preencha seus dados</h2>
          <p class="text-gray-600 mb-2">
            Insira suas informações pessoais para criar uma conta.
          </p>
          <img
            src="https://via.placeholder.com/400x200"
            alt="Placeholder para o passo 2"
            class="w-full rounded-lg"
          />
        </div>

        {/* Passo 3 */}
        <div class="step-container mb-8">
          <h2 class="text-xl font-semibold">Passo 3: Confirme seu e-mail</h2>
          <p class="text-gray-600 mb-2">
            Acesse seu e-mail e clique no link de confirmação enviado pelo
            Last.fm.
          </p>
          <img
            src="https://via.placeholder.com/400x200"
            alt="Placeholder para o passo 3"
            class="w-full rounded-lg"
          />
        </div>

        {/* Passo 4 */}
        <div class="step-container mb-8">
          <h2 class="text-xl font-semibold">Passo 4: Aproveite sua nova conta</h2>
          <p class="text-gray-600 mb-2">
            Agora você pode começar a usar sua conta no Last.fm para registrar suas músicas e descobrir novas.
          </p>
          <img
            src="https://via.placeholder.com/400x200"
            alt="Placeholder para o passo 4"
            class="w-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
