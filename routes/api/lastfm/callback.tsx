import Redirect from '../../../islands/Redirect.tsx'

export default function RedirectPage() {
  const searchParams = new URLSearchParams(globalThis.location.search);
  const token = searchParams.get('token');

  const url = `https://telegram.me/bot?start=${token}`;

  return (
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100 text-center p-6">
      <h1 class="text-2xl font-bold mb-4 text-gray-800">
        Você está sendo redirecionado para o Telegram...
      </h1>
      <p class="text-lg text-gray-600 mb-8">
        Caso não seja redirecionado automaticamente, clique{" "}
        <a href={url} class="text-blue-500 underline hover:text-blue-700">
          aqui
        </a>.
      </p>
      <p class="text-sm text-gray-500 mb-12">
        Após o Telegram abrir, você pode fechar esta página com segurança.
      </p>
      <Redirect url={url} delay={250} />
    </div>
  );
}
