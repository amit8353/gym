import Note from "../../models/Note.js";

export const createNote = async (req, res) => {
  try {
    const { title, content, category, selectedColor } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const note = new Note({ user: req.user.id, title, content, category, selectedColor });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//  Update a Note
export const updateNote = async (req, res) => {
  try {
    const { title, content, category, selectedColor } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    note.category = category || note.category;
    note.selectedColor = selectedColor || note.selectedColor;


    await note.save();
    res.json({ message: "Note updated successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteNote = async (req, res) => {
  try {
    console.log("Delete request received for ID:", req.params.id);
    console.log("User ID:", req.user.id);

    const note = await Note.findOneAndDelete({
      _id: req.params.id, 
      user: req.user.id,
    });

    if (!note) {
      console.log("Note not found");
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Note deleted successfully");
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Server error" });
  }
};

