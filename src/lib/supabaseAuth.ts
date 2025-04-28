// lib/supabaseAuth.ts

"use client";

import { supabase } from "@/lib/supabaseClient";

// Signup function
export async function signUpUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Login function
export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Logout function
export async function logoutUser() {
  await supabase.auth.signOut();
}
export { supabase };
