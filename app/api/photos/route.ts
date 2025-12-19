import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If you want to restrict to logged in users only:
  // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get photos from Supabase DB
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("taken_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Supabase Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const caption = formData.get("caption") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 1. Upload to Supabase Storage
    // Use a simplified path: userID/timestamp.ext
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      throw uploadError;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    // 3. Extract Metadata (Server-side)
    // We parse the buffer to get EXIF data
    // 3. Extract Metadata (Now from Client FormData)
    const lat = formData.get("lat") ? parseFloat(formData.get("lat") as string) : null;
    const lng = formData.get("lng") ? parseFloat(formData.get("lng") as string) : null;
    let takenAt = formData.get("taken_at") as string || new Date().toISOString();
    let device = formData.get("device") as string || "Unknown Camera";
    const filterStyle = formData.get("filter") as string || "normal";
    const albumId = formData.get("album_id") as string | null;

    let locationName = "Unknown Location";

    // Reverse Geocoding via Nominatim (OpenStreetMap)
    if (lat && lng) {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: {
            'User-Agent': 'Polaroida/1.0' // Nominatim requires User-Agent
          }
        });
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          // Prefer city, town, village, or county
          locationName = geoData.address.city ||
            geoData.address.town ||
            geoData.address.village ||
            geoData.address.county ||
            geoData.display_name.split(',')[0];
        }
      } catch (e) {
        console.error("Geocoding failed", e);
      }
    }

    // 4. Insert into Database
    const { data: photoData, error: dbError } = await supabase
      .from("photos")
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption,
        taken_at: takenAt,
        location_name: locationName,
        location_lat: lat,
        location_lng: lng,
        device_info: device,
        weather: "",
        album_id: albumId || null,
        filter_style: filterStyle
      })
      .select()
      .single();

    if (dbError) {
      console.error(dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 5. Handle Tags
    const tagsRaw = formData.get("tags") as string;
    if (tagsRaw && photoData) {
      const tagsList = tagsRaw.split(' ').map(t => t.startsWith('#') ? t.slice(1) : t).filter(Boolean);

      for (const tagName of tagsList) {
        // Find or create tag
        let { data: tag, error: tagErr } = await supabase.from('tags').select('id').eq('name', tagName).single();

        if (!tag) {
          const { data: newTag, error: createErr } = await supabase.from('tags').insert({ name: tagName }).select().single();
          if (!createErr) tag = newTag;
        }

        if (tag) {
          await supabase.from('photo_tags').insert({ photo_id: photoData.id, tag_id: tag.id });
        }
      }
    }

    return NextResponse.json({ success: true, photo: photoData, message: "Photo uploaded successfully" });
  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
