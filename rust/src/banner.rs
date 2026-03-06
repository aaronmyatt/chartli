use colored::Colorize;

const BANNER_LARGE: &str = "█▀▀ █ █ ▄▀█ █▀█ ▀█▀ █   █\n█▄▄ █▀█ █▀█ █▀▄  █  █▄▄ █";
const BANNER_SMALL: &str = "▌ chartli ▐";

pub fn show_banner() {
    let width = terminal_width();
    let banner = if width >= 34 {
        BANNER_LARGE
    } else {
        BANNER_SMALL
    };

    let lines: Vec<&str> = banner.lines().collect();
    if lines.len() > 1 {
        println!("{}", lines[0].cyan());
        println!("{}", lines[1].magenta());
    } else {
        println!("{}", banner.white());
    }
    println!(
        "{}",
        "Render charts from numeric data\n".truecolor(128, 128, 128)
    );
}

fn terminal_width() -> usize {
    term_size().unwrap_or(80)
}

fn term_size() -> Option<usize> {
    #[cfg(unix)]
    {
        use std::mem::MaybeUninit;
        unsafe {
            let mut ws = MaybeUninit::<libc_winsize>::uninit();
            if libc_ioctl(1, TIOCGWINSZ, ws.as_mut_ptr()) == 0 {
                return Some(ws.assume_init().ws_col as usize);
            }
        }
        None
    }
    #[cfg(not(unix))]
    {
        None
    }
}

#[cfg(unix)]
#[repr(C)]
struct libc_winsize {
    ws_row: u16,
    ws_col: u16,
    ws_xpixel: u16,
    ws_ypixel: u16,
}

#[cfg(unix)]
extern "C" {
    fn ioctl(fd: i32, request: u64, ...) -> i32;
}

#[cfg(unix)]
unsafe fn libc_ioctl(fd: i32, request: u64, ptr: *mut libc_winsize) -> i32 {
    unsafe { ioctl(fd, request, ptr) }
}

#[cfg(target_os = "macos")]
const TIOCGWINSZ: u64 = 0x40087468;

#[cfg(all(unix, not(target_os = "macos")))]
const TIOCGWINSZ: u64 = 0x5413;
