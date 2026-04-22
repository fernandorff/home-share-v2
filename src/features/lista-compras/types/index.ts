export interface ShoppingItem {
  id: number
  publicId: string
  name: string
  isPurchased: boolean
  createdAt: string
  addedBy?: { id: number; name: string } | null
}
