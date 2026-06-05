import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useMinistry = () => {
  const { user, session, loading: authLoading } = useAuth();
  const [isMinistry, setIsMinistry] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (authLoading) {
        setLoading(true);
        return;
      }
      if (!user || !session) {
        setIsMinistry(false);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "ministry" as any,
        });
        if (error) {
          console.error("Error checking ministry role:", error);
          setIsMinistry(false);
        } else {
          setIsMinistry(!!data);
        }
      } catch (e) {
        console.error("Ministry check failed:", e);
        setIsMinistry(false);
      }
      setLoading(false);
    };
    check();
  }, [user, session, authLoading]);

  return { isMinistry, loading };
};
