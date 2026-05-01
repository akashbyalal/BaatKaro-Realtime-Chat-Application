import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload = (file) => {
  return new Promise((resolve, reject) => {

    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL); // ✅ THIS FIXES EVERYTHING
        } catch (err) {
          reject(err);
        }
      }
    );

  });
};

export default upload;