import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadImage(path, file) {
  const snapshot = await uploadBytes(ref(storage, path), file)
  return getDownloadURL(snapshot.ref)
}

export async function getImageUrl(path) {
  return getDownloadURL(ref(storage, path))
}

export async function deleteImage(path) {
  await deleteObject(ref(storage, path))
}
