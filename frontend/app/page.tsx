import Image from "next/image";
import LoginCard from "./components/LoginCard/LoginCard";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import TaskBoard from "./components/TaskBoard/TaskBoard";
import ProjectBoard from "./components/ProjectBoard/ProjectBoard";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/tasks");
}