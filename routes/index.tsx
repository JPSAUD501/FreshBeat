export default function Home() {
  return (
    <div class='min-h-screen flex flex-col bg-gray-50 font-sans'>
      <header class='bg-gradient-to-b from-[#86efac] to-[#6ee7b7] py-12 shadow-md'>
        <div class='container mx-auto text-center px-4'>
          <div class='text-7xl mb-6 drop-shadow-sm'>🍋</div>
          <h1 class='text-5xl font-extrabold mb-3 text-gray-900 tracking-tight'>FreshBeat</h1>
          <p class='text-2xl text-gray-800 font-medium opacity-90'>Seu tracker musical com um toque cítrico!</p>
        </div>
      </header>

      <main class='flex-grow container mx-auto px-4 py-12 flex flex-col items-center justify-center'>
        <section class='text-center mb-16 max-w-2xl'>
          <h2 class='text-3xl font-bold mb-6 text-gray-800 leading-tight'>Descubra uma nova forma de acompanhar sua música</h2>
          <p class='text-xl text-gray-600 leading-relaxed'>FreshBeat é um bot tracker musical inovador que traz um sabor fresco para sua experiência musical.</p>
        </section>
        <section class='text-center'>
          <a href='https://t.me/FreshBeatBot' class='btn bg-[#86efac] hover:bg-[#6ee7b7] text-gray-900 border-none btn-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-full px-8 text-lg font-bold'>Comece a usar o FreshBeat agora!</a>
        </section>
      </main>

      <footer class='py-6 bg-white border-t border-gray-200'>
        <div class='container mx-auto text-center px-4'>
          <p class='text-gray-500 font-medium'>&copy; 2024 FreshBeat. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
