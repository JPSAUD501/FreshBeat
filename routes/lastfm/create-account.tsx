import { Head } from "$fresh/runtime.ts";

export default function CreateAccount() {
  return (
    <>
      <Head>
        <title>Como criar uma conta no Last.fm</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta name="description" content="Passo a passo de como criar uma conta no Last.fm." />
        <meta name="theme-color" content="#0088cc" /> {/* Cor padrão do Telegram */}
      </Head>

      <div class="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-bold mb-4 text-center text-[#0088cc]">Como criar uma conta no Last.fm</h1>
        <div class="space-y-6">
          <Step 
            number={1} 
            title="Acesse o site do Last.fm" 
            description="Abra o navegador e vá para o site oficial do Last.fm." 
            imageUrl="/images/placeholder1.png" 
          />
          <Step 
            number={2} 
            title="Clique em 'Sign Up'" 
            description="Clique no botão de 'Sign Up' localizado na parte superior direita da tela." 
            imageUrl="/images/placeholder2.png" 
          />
          <Step 
            number={3} 
            title="Preencha o formulário de cadastro" 
            description="Insira seu email, crie um nome de usuário e senha para registrar-se." 
            imageUrl="/images/placeholder3.png" 
          />
          <Step 
            number={4} 
            title="Confirme o email" 
            description="Acesse seu email e clique no link de confirmação enviado pelo Last.fm." 
            imageUrl="/images/placeholder4.png" 
          />
          <Step 
            number={5} 
            title="Pronto!" 
            description="Agora você já pode usar sua conta no Last.fm e aproveitar todos os recursos." 
            imageUrl="/images/placeholder5.png" 
          />
        </div>
      </div>
    </>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
  imageUrl: string;
}

function Step({ number, title, description, imageUrl }: StepProps) {
  return (
    <div class="p-4 bg-[#f9f9f9] rounded-lg shadow-sm flex flex-col items-center">
      <div class="w-full h-40 mb-4">
        <img 
          src={imageUrl} 
          alt={`Passo ${number}`} 
          class="w-full h-full object-cover rounded-md border border-gray-200"
        />
      </div>
      <h2 class="text-lg font-semibold mb-2 text-[#0088cc]">Passo {number}: {title}</h2>
      <p class="text-gray-700 text-center">{description}</p>
    </div>
  );
}
