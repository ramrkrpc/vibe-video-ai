import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const categories = ["All", "Business", "Casual", "Diverse", "Premium"];

const mockAvatars = [
  { id: "1", name: "Sarah Chen", category: "Business", preview: null, gender: "Female" },
  { id: "2", name: "James Wilson", category: "Business", preview: null, gender: "Male" },
  { id: "3", name: "Aisha Patel", category: "Diverse", preview: null, gender: "Female" },
  { id: "4", name: "Marcus Johnson", category: "Casual", preview: null, gender: "Male" },
  { id: "5", name: "Elena Rodriguez", category: "Premium", preview: null, gender: "Female" },
  { id: "6", name: "David Kim", category: "Business", preview: null, gender: "Male" },
  { id: "7", name: "Fatima Al-Rashid", category: "Diverse", preview: null, gender: "Female" },
  { id: "8", name: "Tom Anderson", category: "Casual", preview: null, gender: "Male" },
  { id: "9", name: "Yuki Tanaka", category: "Premium", preview: null, gender: "Female" },
  { id: "10", name: "Carlos Mendez", category: "Diverse", preview: null, gender: "Male" },
  { id: "11", name: "Emma Thompson", category: "Business", preview: null, gender: "Female" },
  { id: "12", name: "Raj Sharma", category: "Casual", preview: null, gender: "Male" },
];

const Avatars = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();

  const filtered = mockAvatars.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || a.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Avatars</h1>
        <p className="text-muted-foreground mt-1">Choose an avatar for your video</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search avatars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? "gradient-primary" : ""}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((avatar, i) => (
          <motion.div
            key={avatar.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              className="glass hover:border-primary/50 transition-all cursor-pointer group hover:glow-primary"
              onClick={() => navigate(`/create?avatar=${avatar.id}`)}
            >
              <CardContent className="p-4">
                <div className="aspect-square rounded-lg bg-secondary flex items-center justify-center mb-3 overflow-hidden group-hover:bg-primary/10 transition-colors">
                  <User className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm font-medium text-foreground truncate">{avatar.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{avatar.category}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Avatars;
