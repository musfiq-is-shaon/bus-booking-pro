'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signUpSchema, signInSchema } from '@/lib/schemas';

export async function signUp(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    fullName: formData.get('fullName') as string,
  };

  const validated = signUpSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.fullName,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Account created! You can now sign in.' };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signIn(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validated = signInSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      error: validated.error.errors[0].message,
    };
  }

  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Sign out
export async function signOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
  } catch (error) {
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return profile;
  } catch (error) {
    return null;
  }
}

// Check if user is admin
export async function isAdmin() {
  const profile = await getCurrentUser();
  return profile?.role === 'admin';
}
