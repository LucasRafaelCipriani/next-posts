'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { storePost, updatePostLikeStatus } from './posts';
import { uploadImage } from './cloudinary';

export const createPostAction = async (prevState, formData) => {
  const title = formData.get('title');
  const image = formData.get('image');
  const content = formData.get('content');
  let errors = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required.');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required.');
  }

  if (!image || image.size === 0) {
    errors.push('Image is required.');
  }

  if (errors.length > 0) {
    return {
      errors,
    };
  }

  let imageUrl;

  try {
    imageUrl = await uploadImage(image);
  } catch {
    throw new Error(
      'Image upload failed, post was not created. Please try again later.'
    );
  }

  try {
    await storePost({
      imageUrl,
      title,
      content,
      userId: 1,
    });
  } catch {
    throw new Error('Post creation failed. Please try again later.');
  }

  revalidatePath('/', 'layout');
  redirect('/feed');
};

export const togglePostLikeStatus = async (postId) => {
  try {
    await updatePostLikeStatus(postId, 2);
  } catch {
    throw new Error('Post like failed. Please try again later.');
  }

  revalidatePath('/', 'layout');
};
