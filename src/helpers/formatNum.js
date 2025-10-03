export const formatNum = (num, round = 2) => {
  // Обрабатываем случай нуля
  if (num === 0 || Math.abs(num) < 0.0001) {
    return round === 0 ? '0' : '0.' + '0'.repeat(round)
  }

  let formattedNumber = num < 0 ? num * -1 : num
  console.log(formattedNumber)
  formattedNumber = formattedNumber.toFixed(round)

  // Проверяем, не получился ли ноль после округления
  if (parseFloat(formattedNumber) === 0) {
    return round === 0 ? '0' : '0.' + '0'.repeat(round)
  }

  if (formattedNumber >= 10000) {
    // Разделяем целую и дробную части
    const parts = String(formattedNumber).split('.')
    // Форматируем целую часть, добавляя пробелы
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

    // Объединяем целую и дробную части обратно
    return num < 0 ? '-' + parts.join('.') : parts.join('.')
  }

  return num < 0 ? formattedNumber * -1 : formattedNumber
}
