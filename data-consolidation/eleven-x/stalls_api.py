import x11_auto as x11

def update_stall_history(stall_info, 
                         latest_stored_data,
                         alltime=False, 
                         start_date=0, 
                         end_date=0, 
                         ascending=True):
    latest_stall_date = x11.get_latest_stall_data(474)
    print(latest_stall_date)
    return 0


def get_new_stall_data(stall_info, last_date):
    stall_history = x11.get_stall_history(stall_info, start_date=last_date)
    return 0

if __name__ == "__main__":
    print(x11.get_latest_stall_data(474))