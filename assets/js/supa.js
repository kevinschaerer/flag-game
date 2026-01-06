const supabaseUrl = "https://ppsvsdgqymqdrxrhsemm.supabase.co";
const supabaseKey = "sb_publishable_P2cxw244LdR-GGnlGMwA0w_Ri6usIEf";
const supa = supabase.createClient(supabaseUrl, supabaseKey, {
  auth: {
    redirectTo: window.location.origin,
  },
});

export { supa };
