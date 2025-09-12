import gsap from 'gsap'

// Функция для выбора случайного цвета
const getRandomColor = () => {
  const colors = ['#439563', '#FFC32A', '#2971EB', '#EF8933', '#F092F9', '#E90037']
  const randomColorIndex = Math.floor(Math.random() * colors.length)
  return colors[randomColorIndex]
}

// Анимация случайного path с вращением и сменой цвета
const animateRandomPath = (paths) => {
  if (!paths || paths.length === 0) return

  const randomIndex = Math.floor(Math.random() * paths.length)
  const path = paths[randomIndex]
  const randomColor = getRandomColor()

  gsap.to(path, {
    duration: 0.3,
    rotation: 360,
    fill: randomColor,
    transformOrigin: 'center',
    onComplete: () => {
      gsap.to(path, {
        duration: 0.3,
        delay: 1,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        fill: '#fff',
      })
    },
  })
}

// Запуск бесконечной анимации
export const startAnimation = (paths) => {
  if (!paths || paths.length === 0) {
    console.warn('Не поступили paths параметры')
  }
  animateRandomPath(paths)
  setTimeout(() => startAnimation(paths), 2500)
}
