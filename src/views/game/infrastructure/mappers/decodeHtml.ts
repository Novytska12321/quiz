const htmlEntityDecoder = document.createElement('textarea')

export function decodeHtml(value: string): string {
  htmlEntityDecoder.innerHTML = value
  return htmlEntityDecoder.value
}
