const timestr = function(d) {
    const hoursNum = d.getHours();
    const minutesNum = d.getMinutes();
    if (hoursNum == 0) { hours = '00'; } else { hours = hoursNum.toString() }
    if (minutesNum == 0) { minutes = '00'; } else { minutes =minutesNum.toString() }
    return hours + ':' + minutes;
}
const datestr = function(d) {
    const day = d.getDate();
    const suffix = nth(day);
    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()];
    const year = d.getFullYear();
    return day + suffix + ' ' + month + ' ' + year;
}
const nth = function(d) {
  if (d > 3 && d < 21) return 'th';
  switch (d % 10) {
    case 1:  return "st";
    case 2:  return "nd";
    case 3:  return "rd";
    default: return "th";
  }
}
$(function() {
    $.getJSON('../../programme.json', function(data) {
        var $prg = $('#programme');
        var sessions_by_date = {};

        $.each(data, function(i, session) {
            // based on https://stackoverflow.com/posts/15397495/revisions
            const start_date = new Date(Date.parse(session.start_time));
            start_date_index = datestr(start_date);
            if (!(start_date_index in sessions_by_date)) {
                sessions_by_date[start_date_index] = [];
            }
            sessions_by_date[start_date_index].push(session);
        });
        $('#numdays').html(Object.keys(sessions_by_date).length);
        $('.timezone').text('converted to your operating system\'s timezone (' + Intl.DateTimeFormat().resolvedOptions().timeZone + ')');

        var index = 0;
        var expand_day = 0;
        $.each(sessions_by_date, function(date_string, session) {
            const now = new Date();
            const now_string = datestr(now);
            if (now_string == date_string) {
                expand_day = index;
            }
            index++;
        });

        index = 0;
        $.each(sessions_by_date, function(date_string, sessions) {
            html = '<div class="card"><div class="card-header bg-dark" id="programmeDay' + index +'">';
            html += '<h2 class="mb-0"><button class="btn btn-link btn-block text-white font-weight-bold" type="button" id="day' + index +'" data-toggle="collapse" data-target="#programme' + index +'" aria-expanded="' + (index == expand_day ? 'true' : 'false') + '" aria-controls="programme' + index +'">';
            html += date_string + '</button></h2></div>';
            html += '<div id="programme' + index +'" class="collapse' + (index == expand_day ? ' show' : '') + '" aria-labelledby="programmeDay' + index +'" data-parent="#programme">';
            html += '<ul class="list-unstyled prg-day mb-0 border-0 rounded-0">';

            $.each(sessions, function(session_id, session) {
            if (session['type'] == 'Break') {
                html += '<li class="media p-3 bg-light border-bottom rounded-0" id="session-' + index + '"><div class="media-body text-center text-muted">';
                if (session['description'] != '') {
                    html += session['description'];
                }
                html += '</div></li>';
            } else {
                html += '<li class="media prg-row p-3 rounded bg-light border-bottom rounded-0" id="session-' + session['id'] + '"><div class="mr-3"><div class="badge badge-primary text-capitalize mb-2 mr-3">' + session['type'] + '</div>';
                html += '<div class="mb-1 small"><span alt="A clock" class="d-inline-block prg-icon-timing prg-icon-start mr-2"></span><span class="d-inline-block prg-text-timing">Starts at <span class="prg-timing"><span></span>' + timestr(new Date(Date.parse(session['start_time']))) +'</span></div>';
                html += '<div class="mt-1 small"><span alt="A stopwatch" class="d-inline-block prg-icon-timing prg-icon-end mr-2"></span><span class="d-inline-block prg-text-timing">Ends at <span class="prg-timing"><span></span>' + timestr(new Date(Date.parse(session['end_time']))) +'</span>';
                html += '</div></div>';
                html += '<div class="media-body">';
                if (session['youtube'] != '') {
                    html += '<div class="float-right"><a href="' + session['youtube'] + '" title="Watch the session on YouTube" class="d-block prg-icon-yt mr-4"><span class="sr-only">Watch on YouTube</span></a></div>';
                }
                html += '<h4 class="text-primary mt-0 mb-1">' + session['title'] + '</h4>';

                if (session['presenters'] != '') {
                    html += session['presenters'];
                }

                if (session['chairs'] != '') {
                    html += '<em class="small">Chaired by ' + session['chairs'] + '</em>';
                }

                if (session['presentations'].length > 0) {
                    html += '<ol class="list-group mt-3">';
                    $.each(session['presentations'], function(presentation_id) {
                        presentation = session['presentations'][presentation_id]
                        html += '<li class="list-group-item pb-3">';
                        if (presentation['acmdl']) {
                            html += '<div class="float-right">';
                            html += '<a href="' + presentation['acmdl'] + '" title="See the paper in the ACM Digital Library" class="d-block prg-inner-icon prg-icon-acmdl"><span class="sr-only">View paper on the ACM DL</span></a>';
                            html += '</div>';
                        }
                        html += '<strong>' + presentation['title'] + (presentation['type'] != 'Panel' ? ' <span class="badge badge-secondary">' + presentation['type'] + '</span>' : '') + '</strong><br>';
                        html += presentation['authors'] + '</li>';
                    });
                    html += '</ol>';;
                }
                
                html +'</div></li>';
            }
            });

            html += '</ul></div>';
            html += '</div>';

            $prg.append(html);
            index++;
        });
    }); 
});