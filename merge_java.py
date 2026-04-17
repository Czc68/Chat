import os


def merge_java_files(root_dir, output_file, ignore_folders=None, ignore_files=None):
    if ignore_folders is None:
        ignore_folders = {'.git', '.idea', 'bin', 'out', 'target', '.settings', '.metadata'}
    if ignore_files is None:
        ignore_files = {'pom.xml', '.classpath', '.project'}

    with open(output_file, 'w', encoding='utf-8') as f_out:
        f_out.write(f"# 项目代码汇总\n\n> 根目录: {root_dir}\n\n")

        for root, dirs, files in os.walk(root_dir):
            # 排除不想让脚本进入的文件夹
            dirs[:] = [d for d in dirs if d not in ignore_folders]

            for file in files:
                # 只读取 Java 文件，且不在忽略列表中
                if file.endswith('.java') and file not in ignore_files:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)

                    f_out.write(f"## 文件: {relative_path}\n")
                    f_out.write("```java\n")

                    try:
                        with open(file_path, 'r', encoding='utf-8') as f_in:
                            f_out.write(f_in.read())
                    except Exception as e:
                        f_out.write(f"// 读取文件失败: {e}\n")

                    f_out.write("\n```\n\n---\n\n")

    print(f"完成！整合后的文件已保存至: {output_file}")


# 使用示例
if __name__ == "__main__":
    # 修改为你的 Java 源码所在的路径
    project_path = "."
    # 导出的文件名
    output_name = "project_code_context.md"

    # 在这里添加你不想读取的文件夹名
    my_ignore_folders = {
        '.git', '.idea', 'bin', 'out', 'target', 'lib',  # Java 相关
        'node_modules', 'dist', 'build', '.npm', 'public'  # Node.js & 前端相关
    }
    my_ignore_files = {
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
        'pom.xml', '.classpath', '.project'
    }

    merge_java_files(project_path, output_name, ignore_folders=my_ignore_folders)