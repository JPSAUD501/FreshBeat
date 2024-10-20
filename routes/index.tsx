export default function Home() {
  return (
    <div class='min-h-screen flex flex-col'>
      <header class='bg-gradient-to-r bg-[#86efac] py-8'>
        <div class='container mx-auto text-center'>
          <div class='text-6xl mb-4'>🍋</div>
          <h1 class='text-4xl font-bold mb-2 text-gray-950'>FreshBeat</h1>
          <p class='text-xl text-gray-950'>Seu tracker musical com um toque cítrico!</p>
        </div>
      </header>

      <main class='flex-grow container mx-auto px-4 py-8'>
        <section class='text-center mb-12'>
          <h2 class='text-3xl font-bold mb-4 text-gray-950'>Descubra uma nova forma de acompanhar sua música</h2>
          <p class='text-xl text-gray-600'>FreshBeat é um bot tracker musical inovador que traz um sabor fresco para sua experiência musical.</p>
        </section>
        <section class='text-center'>
          <a href='https://t.me/FreshBeatBot' class='btn bg-[#86efac] hover:bg-[#8aef86] text-gray-950 border-none btn-lg'>Comece a usar o FreshBeat agora!</a>
        </section>
      </main>

      <footer class='py-4 border-t border-gray-200'>
        <div class='container mx-auto text-center'>
          <p class='text-gray-600'>&copy; 2024 FreshBeat. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
