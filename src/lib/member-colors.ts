// Paleta de cores — Fernando: terracotta, Tatiana: verde selvagem
// As duas primeiras cores da paleta sao atribuidas automaticamente por index
export const COLOR_PALETTE = [
  { id: 'terracotta', label: 'Terracotta', hex: '#C2684A', bg: 'rgba(194, 104, 74, 0.18)', border: 'rgba(194, 104, 74, 0.35)', text: '#B05A3C' },
  { id: 'green', label: 'Verde Selvagem', hex: '#4A8C5C', bg: 'rgba(74, 140, 92, 0.18)', border: 'rgba(74, 140, 92, 0.35)', text: '#3D7A4E' },
  { id: 'amber', label: 'Ambar', hex: '#C4933E', bg: 'rgba(196, 147, 62, 0.18)', border: 'rgba(196, 147, 62, 0.35)', text: '#A67B2E' },
  { id: 'sage', label: 'Salvia', hex: '#7DA07E', bg: 'rgba(125, 160, 126, 0.18)', border: 'rgba(125, 160, 126, 0.35)', text: '#5E8B5F' },
  { id: 'clay', label: 'Argila', hex: '#A0725C', bg: 'rgba(160, 114, 92, 0.18)', border: 'rgba(160, 114, 92, 0.35)', text: '#8B604C' },
  { id: 'forest', label: 'Floresta', hex: '#2E6B4A', bg: 'rgba(46, 107, 74, 0.18)', border: 'rgba(46, 107, 74, 0.35)', text: '#2E6B4A' },
  { id: 'rust', label: 'Ferrugem', hex: '#A44B2A', bg: 'rgba(164, 75, 42, 0.18)', border: 'rgba(164, 75, 42, 0.35)', text: '#A44B2A' },
  { id: 'olive', label: 'Oliva', hex: '#7A8B4A', bg: 'rgba(122, 139, 74, 0.18)', border: 'rgba(122, 139, 74, 0.35)', text: '#6A7B3A' },
  { id: 'sienna', label: 'Sienna', hex: '#A0522D', bg: 'rgba(160, 82, 45, 0.18)', border: 'rgba(160, 82, 45, 0.35)', text: '#A0522D' },
  { id: 'moss', label: 'Musgo', hex: '#5A7A5A', bg: 'rgba(90, 122, 90, 0.18)', border: 'rgba(90, 122, 90, 0.35)', text: '#4A6A4A' },
  { id: 'copper', label: 'Cobre', hex: '#B87333', bg: 'rgba(184, 115, 51, 0.18)', border: 'rgba(184, 115, 51, 0.35)', text: '#9A6028' },
  { id: 'teal', label: 'Teal', hex: '#3A8A7A', bg: 'rgba(58, 138, 122, 0.18)', border: 'rgba(58, 138, 122, 0.35)', text: '#2E7A6A' },
]

export interface MemberColor {
  bg: string
  border: string
  text: string
}

export interface MemberColorMap {
  [userId: number]: MemberColor
}

export interface MemberWithColor {
  userId: number
  color?: string | null
}

/**
 * Converte uma cor hex para o formato MemberColor com opacidades
 */
export function hexToMemberColor(hex: string): MemberColor {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)

  return {
    bg: `rgba(${r}, ${g}, ${b}, 0.18)`,
    border: `rgba(${r}, ${g}, ${b}, 0.35)`,
    text: `#${cleanHex}`
  }
}

/**
 * Encontra uma cor da paleta pelo hex
 */
export function findPaletteColorByHex(hex: string): typeof COLOR_PALETTE[0] | undefined {
  const normalizedHex = hex.toLowerCase()
  return COLOR_PALETTE.find(c => c.hex.toLowerCase() === normalizedHex)
}

/**
 * Gera um mapa de cores para os membros de um grupo
 * Se o membro tiver uma cor customizada, usa ela
 * Caso contrario, atribui uma cor baseada no indice
 */
export function generateMemberColors(members: MemberWithColor[]): MemberColorMap {
  const sortedMembers = [...members].sort((a, b) => a.userId - b.userId)

  const colorMap: MemberColorMap = {}
  let autoColorIndex = 0

  sortedMembers.forEach((member) => {
    if (member.color) {
      const paletteColor = findPaletteColorByHex(member.color)
      if (paletteColor) {
        colorMap[member.userId] = { bg: paletteColor.bg, border: paletteColor.border, text: paletteColor.text }
      } else {
        colorMap[member.userId] = hexToMemberColor(member.color)
      }
    } else {
      const palette = COLOR_PALETTE[autoColorIndex % COLOR_PALETTE.length]
      colorMap[member.userId] = { bg: palette.bg, border: palette.border, text: palette.text }
      autoColorIndex++
    }
  })

  return colorMap
}

/**
 * Retorna a cor de um membro especifico
 */
export function getMemberColor(colorMap: MemberColorMap, userId: number): MemberColor {
  return colorMap[userId] || { bg: COLOR_PALETTE[0].bg, border: COLOR_PALETTE[0].border, text: COLOR_PALETTE[0].text }
}
