import { supabase } from "../config/supabase.js";

export const preparePayloadForCreate = async (params) => {
  return await supabase.rpc("prepare_payload_for_create", params);
};
